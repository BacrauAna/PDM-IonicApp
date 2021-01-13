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

type SaveBeautyFn = (beauty: BeautyProps,connected: boolean) => Promise<any>;
type DeleteBeautyFn = (beauty: BeautyProps, connected: boolean) => Promise<any>;
type UpdateServerFn = () => Promise<any>;
type ServerBeauty = (id: string, version: number) => Promise<any>;

export interface BeautyState {
    beauties?: BeautyProps[];
    oldBeauty?: BeautyProps;
    fetching: boolean;
    fetchingError?: Error | null;
    saving: boolean;
    deleting: boolean;
    savingError?: Error | null;
    deletingError?: Error | null;
    saveBeauty?: SaveBeautyFn;
    deleteBeauty?: DeleteBeautyFn;
    updateServer?: UpdateServerFn,
    getServerBeauty?: ServerBeauty,
}

interface ActionProps {
    type: string;
    payload?: any;
}

const initialState: BeautyState = {
    fetching: false,
    saving: false,
    deleting: false,
    oldBeauty: undefined,
};

const FETCH_ITEMS_STARTED = "FETCH_ITEMS_STARTED";
const FETCH_ITEMS_SUCCEEDED = "FETCH_ITEMS_SUCCEEDED";
const FETCH_ITEMS_FAILED = "FETCH_ITEMS_FAILED";

const SAVE_ITEM_STARTED = "SAVE_ITEM_STARTED";
const SAVE_ITEM_SUCCEEDED = "SAVE_ITEM_SUCCEEDED";
const SAVE_ITEM_SUCCEEDED_OFFLINE = "SAVE_ITEM_SUCCEEDED_OFFLINE";
const SAVE_ITEM_FAILED = "SAVE_ITEM_FAILED";

const DELETE_ITEM_STARTED = "DELETE_ITEM_STARTED";
const DELETE_ITEM_SUCCEEDED = "DELETE_ITEM_SUCCEEDED";
const DELETE_ITEM_FAILED = "DELETE_ITEM_FAILED";

const reducer: (state: BeautyState, action: ActionProps) => BeautyState = (
    state,
    { type, payload }
) => {
    // @ts-ignore
    if (type === FETCH_ITEMS_STARTED) {
        return {...state, fetching: true, fetchingError: null};
    } else if (type === FETCH_ITEMS_SUCCEEDED) {
        return {...state, beauties: payload.beauties, fetching: false};
    } else if (type === FETCH_ITEMS_FAILED) {
        return {...state, fetchingError: payload.error, fetching: false};
    } else if (type === SAVE_ITEM_STARTED) {
        return {...state, savingError: null, saving: true};
    } else if (type === SAVE_ITEM_SUCCEEDED) {
        const beauties = [...(state.beauties || [])];
        const beauty = payload.beauty;
        if (beauty._id !== undefined) {
            log("BEAUTY in BeautyProvider: " + JSON.stringify(beauty));
            const index = beauties.findIndex((it) => it._id === beauty._id);
            if (index === -1) {
                beauties.splice(0, 0, beauty);
            } else {
                beauties[index] = beauty;
            }
            return {...state, beauties, saving: false};
        }
        {
            const beauties = [...(state.beauties || [])];
            const beauty = payload.beauty;
            const index = beauties.findIndex((it) => it._id === beauty._id);
            if (index === -1) {
                beauties.splice(0, 0, beauty);
            } else {
                beauties[index] = beauty;
            }
            return {...state, beauties, saving: false};
        }
    } else if (type === SAVE_ITEM_SUCCEEDED_OFFLINE) {
        {
            const beauties = [...(state.beauties || [])];
            const beauty = payload.beauty;
            const index = beauties.findIndex((it) => it._id === beauty._id);
            if (index === -1) {
                beauties.splice(0, 0, beauty);
            } else {
                beauties[index] = beauty;
            }
            return {...state, beauties, saving: false};
        }
    } else if (type === SAVE_ITEM_FAILED) {
        return {...state, savingError: payload.error, saving: false};
    } else if (type === DELETE_ITEM_STARTED) {
        return {...state, deletingError: null, deleting: true};
    } else if (type === DELETE_ITEM_SUCCEEDED) {
        {
            const beauties = [...(state.beauties || [])];
            const beauty = payload.beauty;
            const index = beauties.findIndex((it) => it._id === beauty._id);
            beauties.splice(index, 1);
            return {...state, beauties, deleting: false};
        }
    } else if (type === DELETE_ITEM_FAILED) {
        return {...state, deletingError: payload.error, deleting: false};
    } else {
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
    const updateServer = useCallback<UpdateServerFn>(updateServerCallback, [token]);

    const value = {
        beauties,
        fetching,
        fetchingError,
        saving,
        savingError,
        saveBeauty,
        deleting,
        deleteBeauty,
        updateServer,
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
                //if there's no network, grab cartes from local storage
                const allKeys = Storage.keys();
                console.log(allKeys);
                let promisedBeauties;
                var i;
                promisedBeauties = await allKeys.then(function (allKeys) {
                    // local storage also contains the login token, therefore we must get only beauty objects
                    const promises = [];
                    for (i = 0; i < allKeys.keys.length; i++) {
                        const promiseBeauty = Storage.get({ key: allKeys.keys[i] });
                        promises.push(promiseBeauty);
                    }
                    return promises;
                });

                const allBeauties = [];
                for (i = 0; i < promisedBeauties.length; i++) {
                    const promise = promisedBeauties[i];
                    const prod = await promise.then(function (it) {
                        var object;
                        try {
                            object = JSON.parse(it.value!);
                        } catch (e) {
                            return null;
                        }
                        console.log(typeof object);
                        console.log(object);
                        if (object.status !== 2) {
                            return object;
                        }
                        return null;
                    });
                    if (prod != null) {
                        allBeauties.push(prod);
                    }
                }
                const beauties = allBeauties;
                dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { beauties: beauties } });
                // log("fetchBeauties failed");
                // let realKeys: string[] = [];
                // await Storage.keys().then( (keys)  => {
                //     return keys.keys.forEach(function (value) {
                //         if (value !== "user")
                //             realKeys.push(value);
                //     })
                // });
                //
                // let values: string[] = [];
                // for (const key1 of realKeys) {
                //     await Storage.get({key: key1}).then((value)=>{
                //         // @ts-ignore
                //         values.push(value.value);
                //     })
                // }
                // const beauties: BeautyProps[] = [];
                // for(const value of values){
                //     var beauty = JSON.parse(value);
                //     beauties.push(beauty);
                // }
                // log(beauties);
                // if (!canceled) {
                //     dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {beauties}});
                // }
            }
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if(token?.trim()) {
            closeWebSocket = newWebSocket(token,(message) => {
                if (canceled) {
                    return;
                }
                const { type, payload: beauty } = message;
                log(`ws message, beauty ${type} ${beauty._id}`);
                if (type === 'created' || type === 'updated') {
                    //dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {carte} });
                }
            });
            return () => {
                log('wsEffect - disconnecting');
                canceled = true;
                closeWebSocket?.();
            }
        }
    }

    async function saveBeautyCallback(beauty: BeautyProps,connected: boolean) {
        try {
            console.log("E conectat? ")
            console.log(connected)
            if (!connected) {
                throw new Error();
            }

            log("saveBeauty started");
            dispatch({ type: SAVE_ITEM_STARTED });
            const savedBeauty = await (beauty._id
                ? updateBeauties(token, beauty)
                : createBeauties(token, beauty));
            log("saveBeauty succeeded");
            dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { beauty: savedBeauty } });
        } catch (error) {
            log("saveBeauty failed with error: ", error);

            if (beauty._id === undefined) {
                beauty._id = generateRandomID()
                beauty.status = 1;
                alert("Beauty saved locally!!!");
            } else {
                beauty.status = 2;
                alert("Beauty updated locally!!!");
            }
            await Storage.set({
                key: beauty._id,
                value: JSON.stringify(beauty),
            });

            dispatch({ type: SAVE_ITEM_SUCCEEDED_OFFLINE, payload: { beauty: beauty } });
            //dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
        }
    }

    async function deleteBeautyCallback(beauty: BeautyProps, connected: boolean) {
        try {
            if (!connected) {
                throw new Error();
            }
            dispatch({ type: DELETE_ITEM_STARTED });
            const deletedProduct = await eraseBeauty(token, beauty);
            console.log(deletedProduct);
            await Storage.remove({ key: beauty._id! });
            dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { beauty: beauty } });
        }
        catch (error) {
            beauty.status = 3;
            await Storage.set({
                key: JSON.stringify(beauty._id),
                value: JSON.stringify(beauty),
            });
            alert("Product deleted locally!!!");
            dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { beauty: beauty } });
        }
    }

    async function updateServerCallback() {
        //grab beauties from local storage
        const allKeys = Storage.keys();
        let promisedBeauties;
        var i;

        promisedBeauties = await allKeys.then(function (allKeys) {
            const promises = [];
            for (i = 0; i < allKeys.keys.length; i++) {
                const promiseBeauty = Storage.get({ key: allKeys.keys[i] });
                promises.push(promiseBeauty);
            }
            return promises;
        });

        for (i = 0; i < promisedBeauties.length; i++) {
            const promise = promisedBeauties[i];
            const beauty = await promise.then(function (it) {
                var object;
                try {
                    object = JSON.parse(it.value!);
                } catch (e) {
                    return null;
                }
                return object;
            });
            if (beauty !== null) {
                //beauty has to be added
                if (beauty.status === 1) {
                    dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { beauty: beauty } });
                    await Storage.remove({ key: beauty._id });
                    const oldBeauty = beauty;
                    delete oldBeauty._id;
                    oldBeauty.status = 0;
                    const newBeauty = await createBeauties(token, oldBeauty);
                    dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { beauty: newBeauty } });
                    await Storage.set({
                        key: JSON.stringify(newBeauty._id),
                        value: JSON.stringify(newBeauty),
                    });
                }
                //Beauty has to be updated
                else if (beauty.status === 2) {
                    beauty.status = 0;
                    const newBeauty = await updateBeauties(token, beauty);
                    dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { beauty: newBeauty } });
                    await Storage.set({
                        key: JSON.stringify(newBeauty._id),
                        value: JSON.stringify(newBeauty),
                    });
                }
                //carte has to be deleted
                else if (beauty.status === 3) {
                    beauty.status = 0;
                    await eraseBeauty(token, beauty);
                    await Storage.remove({ key: beauty._id });
                }
            }
        }
    }

    //generates random id for storing carte locally
    function generateRandomID() {
        return "_" + Math.random().toString(36).substr(2, 9);
    }

};
