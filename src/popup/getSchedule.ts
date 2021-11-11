import {GaroonRestAPIClient} from '@miyajan/garoon-rest';
import {Event} from "@miyajan/garoon-rest/lib/client/types";
const { DateTime } = require("luxon");

export const getSchedule = async (): Promise<Event[]> => {
    const startDate = DateTime.local().set({hour:0, minute:0, second:0}).toISO();
    const endDate =　DateTime.local().set({hour:23, minute:59, second:0}).toISO()

    const resp = await new GaroonRestAPIClient({
        baseUrl: 'https://bozuman.cybozu.com/g',
    }).schedule.getEvents({
            rangeStart: startDate,
            rangeEnd: endDate,
        });
    return resp.events;
}
