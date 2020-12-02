import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { BeautyProps } from './BeautyProps';
import { Plugins } from "@capacitor/core";

const { Storage } = Plugins; //local
const beautyUrl = `http://${baseUrl}/api/beauty`;

export const getBeauties: (token: string) => Promise<BeautyProps[]> = token => {
    //return withLogs(axios.get(carteUrl, authConfig(token)), 'getCartes');
    var result = axios.get(beautyUrl, authConfig(token));
    result.then(function (result) {
        result.data.forEach(async (beauty: BeautyProps) => {
            await Storage.set({
                key: beauty._id!,
                value: JSON.stringify({
                    id: beauty._id,
                    data: beauty.data,
                    ora: beauty.ora,
                    servicii: beauty.servicii,
                    nrPersoane: beauty.nrPersoane,
                    nume: beauty.nume,
                    ocupat: beauty.ocupat,
                }),
            });
        });
    });
    return withLogs(result, "getBeauties");
};



export const createBeauties:
    (token: string,
     beauty: BeautyProps)
        => Promise<BeautyProps> = (token, beauty) => {
    var result = axios.post(beautyUrl, beauty, authConfig(token));
    result.then(async function (r) {
        var beauty = r.data;
        await Storage.set({
            key: beauty._id!,
            value: JSON.stringify({
                id: beauty._id,
                data: beauty.data,
                ora: beauty.ora,
                servicii: beauty.servicii,
                nrPersoane: beauty.nrPeroane,
                nume: beauty.nume,
                ocupat: beauty.ocupat,
            }),
        });
    });
    return withLogs(result, "createBeauties");
};

export const updateBeauties:
    (token: string,
     beauty: BeautyProps)
        => Promise<BeautyProps[]> = (token, beauty) => {
    var result = axios.put(`${beautyUrl}/${beauty._id}`, beauty, authConfig(token));
    result.then(async function (r) {
        var beauty = r.data;
        await Storage.set({
            key: beauty._id!,
            value: JSON.stringify({
                id: beauty._id,
                data: beauty.data,
                ora: beauty.ora,
                servicii: beauty.servicii,
                nrPersoane: beauty.nrPeroane,
                nume: beauty.nume,
                ocupat: beauty.ocupat,
            }),
        });
    });
    return withLogs(result, "updateCarte");
};
export const eraseBeauty: (
    token: string,
    beauty: BeautyProps)
    => Promise<BeautyProps[]> = (token, beauty) => {
    var result = axios.delete(`${beautyUrl}/${beauty._id}`, authConfig(token));
    result.then(async function (r) {
        await Storage.remove({ key: beauty._id! });
    });
    return withLogs(result, "deleteBeauty");
};

interface MessageData {
    type: string;
    payload: BeautyProps;
}

const log = getLogger('ws');

export const newWebSocket = (
    token: string,
    onMessage: (data: MessageData) => void
) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log("web socket onopen");
        ws.send(JSON.stringify({ type: "authorization", payload: { token } }));
    };
    ws.onclose = () => {
        log("web socket onclose");
    };
    ws.onerror = (error) => {
        log("web socket onerror", error);
    };
    ws.onmessage = (messageEvent) => {
        log("web socket onmessage");
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    };
};


// import axios from 'axios';
// import { getLogger } from '../core';
// import { BeautyProps } from './BeautyProps';
//
// const log = getLogger('itemApi');
//
// const baseUrl = 'http://localhost:3000';
// const itemUrl = `${baseUrl}/item`;
//
// interface ResponseProps<T> {
//     data: T;
// }
//
// function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
//     log(`${fnName} - started`);
//     return promise
//         .then(res => {
//             log(`${fnName} - succeeded`);
//             return Promise.resolve(res.data);
//         })
//         .catch(err => {
//             log(`${fnName} - failed`);
//             return Promise.reject(err);
//         });
// }
//
// const config = {
//     headers: {
//         'Content-Type': 'application/json'
//     }
// };
//
// export const getItems: () => Promise<BeautyProps[]> = () => {
//     return withLogs(axios.get(itemUrl, config), 'getItems');
// }
//
// export const createItem: (item: BeautyProps) => Promise<BeautyProps[]> = item => {
//     return withLogs(axios.post(itemUrl, item, config), 'createItem');
// }
//
// export const updateItem: (item: BeautyProps) => Promise<BeautyProps[]> = item => {
//     return withLogs(axios.put(`${itemUrl}/${item.id}`, item, config), 'updateItem');
// }
