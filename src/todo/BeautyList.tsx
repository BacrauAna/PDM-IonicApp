import React, {useContext,useState, useEffect} from "react";
import { RouteComponentProps } from "react-router";
import { Redirect } from "react-router-dom";
import { useNetwork } from "../utils/useNetwork";
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
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
    createAnimation,
} from "@ionic/react";
import { add } from "ionicons/icons";
import Beauty from "./Beauty";
import { getLogger } from "../core";
import { BeautyContext } from "./BeautyProvider";
import { AuthContext } from "../auth/AuthProvider";
import { BeautyProps } from "./BeautyProps";

const log = getLogger("BeautyList");

const BeautyList: React.FC<RouteComponentProps> = ({ history }) => {
    const { beauties, fetching, fetchingError, updateServer } = useContext(BeautyContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(
        false
    );
    const { networkStatus } = useNetwork();
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
    log("render");


    async function searchNext($event: CustomEvent<void>) {
        if (beauties && pos < beauties.length) {
            setBeautiesShow([...beautiesShow, ...beauties.slice(pos, 21 + pos)]);
            setPos(pos + 17);
        } else {
            setDisableInfiniteScroll(true);
        }
        await ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    //update server when network status is back online
    useEffect(() => {
        if (networkStatus.connected === true) {
            updateServer && updateServer();
        }
    }, [networkStatus.connected]);

    //pagination
    useEffect(() => {
        if (beauties?.length) {
            setBeautiesShow(beauties.slice(0, 20));
        }
    }, [beauties]);

    useEffect(() => {
        if (filter && beauties) {
            const boolType = filter === "yes";
            setBeautiesShow(beauties.filter((beauty) => beauty.ocupat === boolType));
        }
    }, [filter]);

    //search
    useEffect(() => {
        if (search && beauties) {
            setBeautiesShow(beauties.filter((beauty) => beauty.data.startsWith(search)));
        }
    }, [search]);

    function simpleAnimation() {
        const el = document.querySelector(".networkStatus");
        if (el) {
            const animation = createAnimation()
                .addElement(el)
                .duration(1000)
                .direction("alternate")
                .iterations(Infinity)
                .keyframes([
                    { offset: 0, transform: "scale(1)", opacity: "1" },
                    {
                        offset: 1,
                        transform: "scale(0.95)",
                        opacity: "1",
                    },
                ]);
            animation.play();
        }
    }
    useEffect(simpleAnimation, []);

    function groupAnimations() {
        const elem1 = document.querySelector('.searchBar');
        const elem2 = document.querySelector('.select');
        if (elem1 && elem2) {
            const animation1 = createAnimation()
                .addElement(elem1)
                .fromTo('transform', 'scale(0.8)','scale(1)');
            const animation2 = createAnimation()
                .addElement(elem2)
                .fromTo('transform', 'scale(1)', 'scale(0.8)');
            const parentAnimation = createAnimation()
                .duration(600)
                .direction("alternate")
                .iterations(3)
                .addAnimation([animation1, animation2]);
            parentAnimation.play();    }
    }
    useEffect(groupAnimations, []);


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Beauties List</IonTitle>
                    <IonButton shape="round" slot="end" onClick={handleLogout}>LOGOUT</IonButton>
                    {/*<IonButton  onClick={handleLogout}>Logout</IonButton>*/}
                </IonToolbar>
                <div className="networkStatus">
                    Network is: <b>{networkStatus.connected ? "online" : "offline"}</b>
                </div>
            </IonHeader>
            <IonContent fullscreen>
                <IonLoading isOpen={fetching} message="Fetching beauties" />
                <div className="searchBar">
                <IonSearchbar
                    value={search}
                    debounce={1000}
                    onIonChange={(e) => setSearch(e.detail.value!)}
                ></IonSearchbar>
                </div>
                <div className="select">
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
                </div>
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
                            status={beauty.status}
                            photoPath={beauty.photoPath}
                            latitude={beauty.latitude}
                            longitude={beauty.longitude}
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
        </IonPage>
    );
};

export default BeautyList;

