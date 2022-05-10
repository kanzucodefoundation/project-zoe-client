import {useEffect, useState} from 'react';
import {search} from "../../utils/ajax";

export interface Props {
    url: string
    initialFilter: any
}

export function useCrud<T extends {id:any}>(props: Props) {
    const [filter, setFilter] = useState<any>(props.initialFilter)
    const [loading, setLoading] = useState<boolean>(true)
    const [data, setData] = useState<T[]>([])
    const [selected, setSelected] = useState<T | null>(null)
    const [dialog, setDialog] = useState<boolean>(false)
    useEffect(() => {
        setLoading(true)
        search(props.url, filter, (resp: T[]) => {
                setData(resp)
            }, undefined,
            () => setLoading(false))
    }, [filter,props.url])

    function onFilter(f: any = {}) {
        setFilter(f)
    }

    function onStartNew() {
        setSelected(null)
        setDialog(true)
    }

    const onCloseDialog = () => {
        setSelected(null)
        setDialog(false)
    }

    const onStartEdit = (dt: T) => {
        setSelected(dt)
        setDialog(true)
    }

    const onSubmitComplete = (dt: T) => {
        if (selected) {
            const newData = data.map((it: T) => {
                if (it.id === dt.id)
                    return dt
                else return it
            })
            setData(newData)
        } else {
            const newData = [...data, dt]
            setData(newData)
        }
        onCloseDialog()
    }


    function onDeleted(dt: T) {
        const newData = data.filter((it: T) => it.id !== dt.id)
        setData(newData)
    }

    return{
        onStartEdit,onStartNew,
        // Ajax Actions completed
        onDeleted,onSubmitComplete,
        onCloseDialog,onFilter,
        data,loading,selected,dialog
    }
}
