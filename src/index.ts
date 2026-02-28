export type Column={
    id:"todo"|"in-progress"|"done",
    title:string,
    position:number
}

export type Task={
    id:string,
    columnId:Column["id"],
    title:string,
    orderInColumn:number,
    priority:"high"|"medium"|"low"

}