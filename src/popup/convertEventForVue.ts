import {EventInfo, Facility, FacilityInfo} from "./event";
import {KintoneRestAPIClient} from "@kintone/rest-api-client";
const {DateTime} = require("luxon");

export const convertEventForVue = async (events: EventInfo[]): Promise<any> => {
    console.log(events);
    const sortedEvents = sort(events);
    let eventsForVue: Object[] = [];

    for (const event of sortedEvents) {
        console.log(event);
        const facilityInfo = await getFacilityInfo(event);
        if ( (event.eventType ===  "REGULAR" || event.eventType ===  "REPEATING") && !event.isAllDay) {
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
                    recent: checkRecent(event)
                }
            );
        }
    }
    console.log(eventsForVue);
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

function checkRecent(event: EventInfo):boolean{
    const now = DateTime.local();
    if(event.start === undefined || event.end === undefined){
        return false;
    }
    return DateTime.fromISO(event.start.dateTime) <= now &&
        DateTime.fromISO(event.end.dateTime) >= now;
}
