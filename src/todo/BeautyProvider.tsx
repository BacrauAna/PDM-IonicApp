import React, { useCallback, useContext, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import { getLogger } from "../core";
import { BeautyProps } from "./BeautyProps";
import {
    createBeauties,
    getBeauties,
    newWebSocket,
    updateBeauties,
    eraseBeauty,
} from "./beautyApi";
import {AuthContext} from "../auth";

import { Plugins } from "@capacitor/core"
const { Storage } = Plugins;

const log = getLogger("BeautyProvider");

type SaveBeautyFn = (beauty: BeautyProps) => Promise<any>;
type DeleteBeautyFn = (beauty: BeautyProps) => Promise<any>;

export interface BeautyState {
    beauties?: BeautyProps[];
    fetching: boolean;
    fetchingError?: Error | null;
    saving: boolean;
    deleting: boolean;
    savingError?: Error | null;
    deletingError?: Error | null;
    saveBeauty?: SaveBeautyFn;
    deleteBeauty?: DeleteBeautyFn;
}

interface ActionProps {
    type: string;
    payload?: any;
}

const initialState: BeautyState = {
    fetching: false,
    saving: false,
    deleting: false,
};

const FETCH_ITEMS_STARTED = "FETCH_ITEMS_STARTED";
const FETCH_ITEMS_SUCCEEDED = "FETCH_ITEMS_SUCCEEDED";
const FETCH_ITEMS_FAILED = "FETCH_ITEMS_FAILED";
const SAVE_ITEM_STARTED = "SAVE_ITEM_STARTED";
const SAVE_ITEM_SUCCEEDED = "SAVE_ITEM_SUCCEEDED";
const SAVE_ITEM_FAILED = "SAVE_ITEM_FAILED";
const DELETE_ITEM_STARTED = "DELETE_ITEM_STARTED";
const DELETE_ITEM_SUCCEEDED = "DELETE_ITEM_SUCCEEDED";
const DELETE_ITEM_FAILED = "DELETE_ITEM_FAILED";

const reducer: (state: BeautyState, action: ActionProps) => BeautyState = (
    state,
    { type, payload }
) => {
    switch (type) {
        case FETCH_ITEMS_STARTED:
            return {...state, fetching: true, fetchingError: null};
        case FETCH_ITEMS_SUCCEEDED:
            return {...state, beauties: payload.beauties, fetching: false};
        case FETCH_ITEMS_FAILED:
            return {...state, fetchingError: payload.error, fetching: false};

        case SAVE_ITEM_STARTED:
            return {...state, savingError: null, saving: true};
        case SAVE_ITEM_SUCCEEDED:
            const beauties = [...(state.beauties || [])];
            const beauty = payload.beauty;
            if (beauty != undefined){
                const index = beauties.findIndex((it) => it._id === beauty._id);
                if (index === -1) {
                    beauties.splice(0, 0, beauty);
                } else {
                    beauties[index] = beauty;
                }
                return {...state, beauties, saving: false};
            }

        case SAVE_ITEM_FAILED:
            return { ...state, savingError: payload.error, saving: false };

        case DELETE_ITEM_STARTED:
            return { ...state, deletingError: null, deleting: true };
        case DELETE_ITEM_SUCCEEDED: {
            const beauties = [...(state.beauties || [])];
            const beauty = payload.beauty;
            const index = beauties.findIndex((it) => it._id === beauty._id);
            beauties.splice(index, 1);
            return { ...state, beauties, deleting: false };
        }

        case DELETE_ITEM_FAILED:
            return { ...state, deletingError: payload.error, deleting: false };
        default:
            return state;
    }
};

export const BeautyContext = React.createContext<BeautyState>(initialState);

interface BeautyProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const BeautyProvider: React.FC<BeautyProviderProps> = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {
        beauties,
        fetching,
        fetchingError,
        saving,
        savingError,
        deleting,
    } = state;
    useEffect(getBeautiesEffect, [token]);
    useEffect(wsEffect, [token]);
    const saveBeauty = useCallback<SaveBeautyFn>(saveBeautyCallback, [token]);
    const deleteBeauty = useCallback<DeleteBeautyFn>(deleteBeautyCallback, [token]);
    const value = {
        beauties,
        fetching,
        fetchingError,
        saving,
        savingError,
        saveBeauty,
        deleting,
        deleteBeauty,
    };
    log("returns");
    return <BeautyContext.Provider value={value}>{children}</BeautyContext.Provider>;

    function getBeautiesEffect() {
        let canceled = false;
        fetchBeauties();
        return () => {
            canceled = true;
        };

        async function fetchBeauties() {
            if (!token?.trim()) {
                return;
            }
            try {
                log("fetchBeauties started");
                dispatch({ type: FETCH_ITEMS_STARTED });
                const beauties = await getBeauties(token);
                log("fetchBeauties succeeded");
                if (!canceled) {
                    dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { beauties } });
                }
            } catch (error) {
                log("fetchBeauties failed");
                let realKeys: string[] = [];
                await Storage.keys().then( (keys)  => {
                    return keys.keys.forEach(function (value) {
                        if (value !== "user")
                            realKeys.push(value);
                    })
                });

                let values: string[] = [];
                for (const key1 of realKeys) {
                    await Storage.get({key: key1}).then((value)=>{
                        // @ts-ignore
                        values.push(value.value);
                    })
                }
                const beauties: BeautyProps[] = [];
                for(const value of values){
                    var beauty = JSON.parse(value);
                    beauties.push(beauty);
                }
                log(beauties);
                if (!canceled) {
                    dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {beauties}});
                }
            }
        }
    }

    async function saveBeautyCallback(beauty: BeautyProps) {
        try {
            log("saveBeauty started");

            dispatch({ type: SAVE_ITEM_STARTED });
            const savedBeauty = await (beauty._id
                ? updateBeauties(token, beauty)
                : createBeauties(token, beauty));
            log("saveBeauty succeeded");
            dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { beauty: savedBeauty } });
        } catch (error) {
            log("saveBeauty failed");
            dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
        }
    }

    async function deleteBeautyCallback(beauty: BeautyProps) {
        try {
            log("delete started");
            dispatch({ type: DELETE_ITEM_STARTED });
            const deletedBeauty = await eraseBeauty(token, beauty);
            log("delete succeeded");
            console.log(deletedBeauty);
            dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { beauty: beauty } });
        } catch (error) {
            log("delete failed");
            dispatch({ type: DELETE_ITEM_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log("wsEffect - connecting");
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, (message) => {
                if (canceled) {
                    return;
                }
                const { type, payload: carte } = message;
                log(`ws message, carte ${type}`);

            });
        }
        return () => {
            log("wsEffect - disconnecting");
            canceled = true;
            closeWebSocket?.();
        };
    }
};
// import React, { useCallback, useEffect, useReducer, useContext } from 'react';
// import PropTypes from 'prop-types';
// import { getLogger } from '../core';
// import { BeautyProps } from './BeautyProps';
// import { createBeauties, getBeauties, updateBeauties, newWebSocket, eraseBeauty } from './beautyApi';
//
// const log = getLogger('BeautyProvider');
//
// type SaveItemFn = (item: BeautyProps) => Promise<any>;
//
// export interface ItemsState {
//     items?: BeautyProps[],
//     fetching: boolean,
//     fetchingError?: Error | null,
//     saving: boolean,
//     savingError?: Error | null,
//     saveItem?: SaveItemFn,
// }
//
// interface ActionProps {
//     type: string,
//     payload?: any,
// }
//
// const initialState: ItemsState = {
//     fetching: false,
//     saving: false,
// };
//
// const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
// const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
// const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
// const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
// const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
// const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
//
// const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
//     (state, { type, payload }) => {
//         switch(type) {
//             case FETCH_ITEMS_STARTED:
//                 return { ...state, fetching: true, fetchingError: null };
//             case FETCH_ITEMS_SUCCEEDED:
//                 return { ...state, items: payload.items, fetching: false };
//             case FETCH_ITEMS_FAILED:
//                 return { ...state, fetchingError: payload.error, fetching: false };
//             case SAVE_ITEM_STARTED:
//                 return { ...state, savingError: null, saving: true };
//             case SAVE_ITEM_SUCCEEDED:
//                 const items = [...(state.items || [])];
//                 const item = payload.item;
//                 const index = items.findIndex(it => it.id === item.id);
//                 if (index === -1) {
//                     items.splice(0, 0, item);
//                 } else {
//                     items[index] = item;
//                 }
//                 return { ...state,  items, saving: false };
//             case SAVE_ITEM_FAILED:
//                 return { ...state, savingError: payload.error, saving: false };
//             default:
//                 return state;
//         }
//     };
//
// export const ItemContext = React.createContext<ItemsState>(initialState);
//
// interface ItemProviderProps {
//     children: PropTypes.ReactNodeLike,
// }
//
// export const BeautyProvider: React.FC<ItemProviderProps> = ({ children }) => {
//     const [state, dispatch] = useReducer(reducer, initialState);
//     const { items, fetching, fetchingError, saving, savingError } = state;
//     useEffect(getItemsEffect, []);
//     const saveItem = useCallback<SaveItemFn>(saveItemCallback, []);
//     const value = { items, fetching, fetchingError, saving, savingError, saveItem };
//     log('returns');
//     return (
//         <ItemContext.Provider value={value}>
//             {children}
//         </ItemContext.Provider>
//     );
//
//     function getItemsEffect() {
//         let canceled = false;
//         fetchItems();
//         return () => {
//             canceled = true;
//         }
//
//         async function fetchItems() {
//             try {
//                 log('fetchItems started');
//                 dispatch({ type: FETCH_ITEMS_STARTED });
//                 const items = await getItems();
//                 log('fetchItems succeeded');
//                 if (!canceled) {
//                     dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
//                 }
//             } catch (error) {
//                 log('fetchItems failed');
//                 dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
//             }
//         }
//     }
//
//     async function saveItemCallback(item: BeautyProps) {
//         try {
//             log('saveItem started');
//             dispatch({ type: SAVE_ITEM_STARTED });
//             const savedItem = await (item.id ? updateItem(item) : createItem(item));
//             log('saveItem succeeded');
//             dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedItem } });
//         } catch (error) {
//             log('saveItem failed');
//             dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
//         }
//     }
// };
