import React, {useContext,useState, useEffect} from "react";
import { RouteComponentProps } from "react-router";
import { Redirect } from "react-router-dom";
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSelect,
    IonSelectOption,
    IonSearchbar,
} from "@ionic/react";
import { add } from "ionicons/icons";
import Beauty from "./Beauty";
import { getLogger } from "../core";
import { BeautyContext } from "./BeautyProvider";
import { AuthContext } from "../auth/AuthProvider";
import { BeautyProps } from "./BeautyProps";

const log = getLogger("BeautyList");

const BeautyList: React.FC<RouteComponentProps> = ({ history }) => {
    const { beauties, fetching, fetchingError } = useContext(BeautyContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(
        false
    );
    const [filter, setFilter] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState<string>("");
    const [pos, setPos] = useState(20);
    const selectOptions = ["no", "yes"];
    const [beautiesShow, setBeautiesShow] = useState<BeautyProps[]>([]);
    const { logout } = useContext(AuthContext);
    const handleLogout = () => {
        logout?.();
        return <Redirect to={{ pathname: "/login" }} />;
    };
    useEffect(() => {
        if (beauties?.length) {
            setBeautiesShow(beauties.slice(0, 20));
        }
    }, [beauties]);
    log("render");
    async function searchNext($event: CustomEvent<void>) {
        if (beauties && pos < beauties.length) {
            setBeautiesShow([...beautiesShow, ...beauties.slice(pos, 21 + pos)]);
            setPos(pos + 17);
        } else {
            setDisableInfiniteScroll(true);
        }
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    useEffect(() => {
        if (filter && beauties) {
            const boolType = filter === "yes";
            setBeautiesShow(beauties.filter((beauty) => beauty.ocupat === boolType));
        }
    }, [filter]);

    useEffect(() => {
        if (search && beauties) {
            setBeautiesShow(beauties.filter((beauty) => beauty.data.startsWith(search)));
        }
    }, [search]);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Beauties List</IonTitle>
                    {/*<IonButton  onClick={handleLogout}>Logout</IonButton>*/}
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonLoading isOpen={fetching} message="Fetching beauties" />
                <IonSearchbar
                    value={search}
                    debounce={1000}
                    onIonChange={(e) => setSearch(e.detail.value!)}
                ></IonSearchbar>
                <IonSelect
                    value={filter}
                    placeholder="Selection about disponibility"
                    onIonChange={(e) => setFilter(e.detail.value)}
                >
                    {selectOptions.map((option) => (
                        <IonSelectOption key={option} value={option}>
                            {option}
                        </IonSelectOption>
                    ))}
                </IonSelect>
                {beautiesShow &&
                beautiesShow.map((beauty: BeautyProps) => {
                    return (
                        <Beauty
                            key={beauty._id}
                            _id={beauty._id}
                            data={beauty.data}
                            ora={beauty.ora}
                            servicii={beauty.servicii}
                            nrPersoane={beauty.nrPersoane}
                            nume={beauty.nume}
                            ocupat={beauty.ocupat}
                            onEdit={(id) => history.push(`/beauty/${id}`)}
                        />
                    );
                })}
                <IonInfiniteScroll
                    threshold="100px"
                    disabled={disableInfiniteScroll}
                    onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}
                >
                    <IonInfiniteScrollContent loadingText="Loading more good beauties..."></IonInfiniteScrollContent>
                </IonInfiniteScroll>
                {fetchingError && (
                    <div>{fetchingError.message || "Failed to fetch beauties"}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push("/beauty")}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
            <IonButton  onClick={handleLogout}>Logout</IonButton>
        </IonPage>
    );
};

export default BeautyList;

// import React, { useContext } from 'react';
// import { RouteComponentProps } from 'react-router';
// import {
//     IonContent,
//     IonFab,
//     IonFabButton,
//     IonHeader,
//     IonIcon,
//     IonList, IonLoading,
//     IonPage,
//     IonTitle,
//     IonToolbar
// } from '@ionic/react';
// import { add } from 'ionicons/icons';
// import Beauty from './Beauty';
// import { getLogger } from '../core';
// import { ItemContext } from './BeautyProvider';
//
// const log = getLogger('BeautyList');
//
// const BeautyList: React.FC<RouteComponentProps> = ({ history }) => {
//     const { items, fetching, fetchingError } = useContext(ItemContext);
//     log('render');
//     return (
//         <IonPage>
//             <IonHeader>
//                 <IonToolbar>
//                     <IonTitle>Beauty Salon</IonTitle>
//                 </IonToolbar>
//             </IonHeader>
//             <IonContent>
//                 <IonLoading isOpen={fetching} message="Fetching items" />
//                 {items && (
//                     <IonList>
//                         {items.map(({ id, data,ora,serv,nrPer,num,lib}) =>
//                             <Beauty key={id} id={id} data={data} ora={ora} serv={serv} nrPer={nrPer} num={num} lib={lib} onEdit={id => history.push(`/item/${id}`)} />)}
//                     </IonList>
//                 )}
//                 {fetchingError && (
//                     <div>{fetchingError.message || 'Failed to fetch items'}</div>
//                 )}
//                 <IonFab vertical="bottom" horizontal="end" slot="fixed">
//                     <IonFabButton onClick={() => history.push('/item')}>
//                         <IonIcon icon={add} />
//                     </IonFabButton>
//                 </IonFab>
//             </IonContent>
//         </IonPage>
//     );
// };
//
// export default BeautyList;
