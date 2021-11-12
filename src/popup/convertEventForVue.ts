import {EventInfo, Facility, FacilityInfo} from "./types";
import {KintoneRestAPIClient} from "@kintone/rest-api-client";
import {GaroonRestAPIClient} from "@miyajan/garoon-rest";
const {DateTime} = require("luxon");

export const convertEventForVue = async (events: EventInfo[]): Promise<any> => {
    const sortedEvents = sort(events);
    let eventsForVue: Object[] = [];

    for (const event of sortedEvents) {
        const facilityInfo = await getFacilityInfo(event);
        const zoomLinkFromNotes = getZoomLinkFromNotes(event);
        const zoomLinkFromDatastore = await getZoomLink(event);
        if ((event.eventType === "REGULAR" || event.eventType === "REPEATING") && !event.isAllDay) {
            eventsForVue.push(
                {
                    id: event.id,
                    subject: event.subject,
                    start: event.start,
                    startStr: event.start !== undefined ? DateTime.fromISO(event.start.dateTime).toFormat('HH:mm') : "--:--",
                    end: event.end,
                    endStr: event.end !== undefined ? DateTime.fromISO(event.end.dateTime).toFormat('HH:mm') : "--:--",
                    facilityNumber: facilityInfo.number,
                    facilityLink: facilityInfo.facilityLink,
                    facilityName: facilityInfo.facilityName,
                    eventLink: "https://bozuman.cybozu.com/g/schedule/view.csp?event=" + event.id,
                    recent: checkRecent(event),
                    zoomLinkFromNote: zoomLinkFromNotes,
                    zoomLinkFromDatastore: zoomLinkFromDatastore
                }
            );
        }
    }
    return filterAndSortEvent(eventsForVue);
}

export const getFacilityInfo = async (event: EventInfo): Promise<FacilityInfo> => {
    if (!event.hasOwnProperty("facilities")) {
        return {facilityLink: '', number: 0, facilityName: '会議室なし'};
    }
    const facilities: Facility[] = event.facilities;
    if (facilities.length === 0) {
        return {facilityLink: '', number: 0, facilityName: '会議室なし'};
    }
    const client = new KintoneRestAPIClient({
        baseUrl: 'https://bozuman.cybozu.com',
    });

    const params = {
        app: 40423,
        fields: ['AccessURL'],
        query: 'garoonFacilityCode = "' + facilities[0].code + '"'
    };

    return await client.record.getRecords(params)
        .then((resp) => {
            console.log(resp)
            if (resp.records.length === 0) {
                return {facilityLink: '', number: 0, facilityName: 'Zoomリンクなし'};
            }
            if (resp.records.length >= 2) {
                return {facilityLink: '', number: facilities.length , facilityName: '複数の会議室'};
            }
            if (typeof resp.records[0]["AccessURL"].value === 'string') {
                return {
                    facilityLink: resp.records[0]["AccessURL"].value,
                    number: facilities.length ,
                    facilityName: facilities[0].name
                };
            }
            return {facilityLink: '', number: 0, facilityName: "取得失敗"};
        });
}

function filterAndSortEvent(events: Object[]): Object[] {
    return events;
}

function sort(events:EventInfo[]):EventInfo[]{
    return events.sort(compare);
}

function compare(a:EventInfo, b:EventInfo) {
    if (a.start.dateTime > b.start.dateTime) {
        return 1;
    }
    if (a.start.dateTime < b.start.dateTime) {
        return -1;
    }
    return 0;
}

function checkRecent(event: EventInfo): boolean {
    const now = DateTime.local();
    if (event.start === undefined || event.end === undefined) {
        return false;
    }
    return DateTime.fromISO(event.start.dateTime) <= now &&
        DateTime.fromISO(event.end.dateTime) >= now;
}

function getZoomLinkFromNotes(event: EventInfo): string | undefined {
    const note = event.notes;
    const regex = /https:\/\/cybozu.zoom.us\/j\/[\w|?|=]+/g;
    const result = note.match(regex);
    if (result === null) {
        return undefined;
    }
    return result[0];
}

async function getZoomLink(event: EventInfo): Promise<string | undefined> {
    const url = 'https://bozuman.cybozu.com/g/api/v1/schedule/events/' + event.id + '/datastore/jp.co.cybozu.schedule.personalZoomInfo';
    return await fetch(url, {
        method: 'GET',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
    }).then(
        async resp => {
            if (resp.ok) {
                return resp.url;
            } else {
                throw new Error(`Request failed: ${resp.status}`);
            }
        })
        .catch(
            () => {return undefined;}
        );
}
