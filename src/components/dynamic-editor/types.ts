export interface IColumn {
    name: string
    inputType?: InputType
    inputProps?:any
    label: string
    render?: (value: any, row: any) => any
}


export enum InputType {
    Text = 'Text',
    Select = 'Select',
    Date = 'Date',
    TextArea = 'TextArea',
    RemoteSelect = 'RemoteSelect',
    Radio = 'Radio',
}
