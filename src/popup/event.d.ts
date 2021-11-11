export interface EventInfo {
    id: string;
    subject: string;
    start: DateInfo;
    startStr: string;
    end: DateInfo;
    endStr:string;
    eventType: string;
    eventMenu: string;
    visibilityType: string;
    isAllDay: boolean;
    isStartOnly: boolean;
    facilities: Facility[];
    recent: boolean;
}


export interface DateInfo{
    dateTime: string;
    timezone: string;
}

export interface Facility{
    id: string;
    name: string;
    code: string;
}

export interface FacilityInfo{
    facilityLink: string
    number: number;
    facilityName: string;
}

export enum EventsType {
    MY_EVENTS,
    MY_GROUP_EVENTS,
    TEMPLATE,
    NOW_LOADING,
    ERROR,
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

export interface EventInfo {
    id: string;
    subject: string;
    startTime: Date;
    endTime: Date;
    eventType: string;
    eventMenu: string;
    visibilityType: string;
    attendees: Participant[];
    isAllDay: boolean;
    isStartOnly: boolean;
}

export interface Participant {
    id: string;
    name: string;
}

export interface MyGroupEvent {
    eventInfo: EventInfo;
    participants: Participant[];
}

export interface TemplateEvent {
    todayEventInfoList: EventInfo[];
    nextDayEventInfoList: EventInfo[];
    previousDayEventInfoList: EventInfo[];
    indexes: SpecialTemplateCharactorIndexs;
}

export interface RecieveEventMessage {
    eventType: EventsType;
    dateStr: string;
    events: any;
    templateText: string;
}

export interface EventMenuColor {
    r: number;
    g: number;
    b: number;
}

export interface SpecialTemplateCharactorIndexs {
    todayIndexes: number[];
    nextDayIndexes: number[];
    previousDayIndexes: number[];
}
