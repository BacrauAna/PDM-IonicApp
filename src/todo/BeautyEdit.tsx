import React, { useContext, useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonInput,
    IonLabel,
    IonLoading,
    IonCheckbox,
    IonPage,
    IonTitle,
    IonToolbar,
    IonFab,
    IonFabButton, IonIcon, IonImg, createAnimation
} from '@ionic/react';
import { getLogger } from '../core';
import { BeautyContext } from './BeautyProvider';
import { RouteComponentProps } from 'react-router';
import { BeautyProps } from './BeautyProps';
import { useNetwork } from "../utils/useNetwork";
import {usePhotoGallery} from "../utils/usePhotoGallery";
import {camera} from "ionicons/icons";
import {MyMap} from "../utils/MyMap";

const log = getLogger('BeautyEdit');

interface BeautyEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const BeautyEdit: React.FC<BeautyEditProps> = ({ history, match }) => {
    const { beauties, saving, savingError, saveBeauty, deleteBeauty, getServerBeauty, oldBeauty } = useContext(BeautyContext);
    const [data, setData] = useState('');
    const [ora, setOra] = useState('');
    const [servicii, setServicii] = useState('');
    const [nrPersoane, setNrPersoane] = useState(0);
    const [nume, setNume] = useState('');
    const [ocupat, setOcupat] = useState(false);
    const [photoPath, setPhotoPath] = useState('');
    const [latitude, setLatitude] = useState(46.752883);
    const [longitude, setLongitude] = useState(23.598593);
    const [beauty, setBeauty] = useState<BeautyProps>();
    const [beauty2, setBeauty2] = useState<BeautyProps>();
    const { networkStatus } = useNetwork();
    const { takePhoto } = usePhotoGallery();

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || "";
        const beauty = beauties?.find(it => it._id === routeId);
        setBeauty(beauty);
        if (beauty) {
            setData(beauty.data);
            setOra(beauty.ora);
            setServicii(beauty.servicii);
            setNrPersoane(beauty.nrPersoane);
            setNume(beauty.nume);
            setOcupat(beauty.ocupat)
            setPhotoPath(beauty.photoPath)
            if (beauty.latitude) setLatitude(beauty.latitude);
            if (beauty.longitude) setLongitude(beauty.longitude);
        }
    }, [match.params.id, beauties, getServerBeauty]);

    useEffect(() => {
        setBeauty2(oldBeauty);
        log("OLD BEAUTY: " + JSON.stringify(oldBeauty));
    }, [oldBeauty]);

    const handleSave = () => {
        const editedBeauty = beauty
            ? { ...beauty, data,ora,servicii,nrPersoane,nume,ocupat, photoPath, latitude, longitude, status: 0 }
            : { data,ora,servicii,nrPersoane,nume,ocupat, photoPath, latitude, longitude, status: 0 };
        saveBeauty && saveBeauty(editedBeauty, networkStatus.connected).then(() => {
            log(JSON.stringify(beauty2));
            if (beauty2 === undefined) history.goBack()
        });
    };

    const handleDelete = () => {
        const editedBeauty = beauty
            ? { ...beauty, data,ora,servicii,nrPersoane,nume,ocupat,photoPath, latitude, longitude, status: 0 }
            : { data,ora,servicii,nrPersoane,nume,ocupat,photoPath, latitude, longitude, status: 0};
        deleteBeauty && deleteBeauty(editedBeauty, networkStatus.connected).then(() => history.goBack());
    };

    function chainAnimations() {
        const label1 = document.querySelector('.label1');
        const label2 = document.querySelector('.label2');
        const label3 = document.querySelector('.label3');
        const label4 = document.querySelector('.label4');
        const label5 = document.querySelector('.label5');
        const elem2 = document.querySelector('.checkBox');
        if (label1 && label2 && label3 && label4 && label5 && elem2) {
            const animation1 = createAnimation()
                .addElement(Array.of(label1, label2, label3, label4, label5))
                .duration(200)
                .direction("alternate")
                .iterations(3)
                .fromTo('transform', 'rotate(0)', 'rotate(20deg)')
                .fromTo('transform', 'rotate(20deg)', 'rotate(0)');

            const animation2= createAnimation()
                .addElement(elem2)
                .duration(500)
                .fromTo('transform', 'scale(1)', 'scale(0.9)');
            (async () => {
                await animation1.play();
                await animation2.play();
            })();
        }
    }
    useEffect(chainAnimations, []);

    //log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                        <IonButton onClick={handleDelete}>
                            Delete
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem>
                    <div className="label1"><IonLabel>Data(LL/ZZ/AAAA): </IonLabel></div>
                    <IonInput
                        className="inputField"
                        value={data}
                        onIonChange={(e) => setData(e.detail.value || "")}
                    />
                </IonItem>
                <IonItem>
                    <div className="label2"><IonLabel>Ora(HH:mm): </IonLabel></div>
                    <IonInput
                        className="inputField"
                        value={ora}
                        onIonChange={(e) => setOra(e.detail.value || "")}
                    />
                </IonItem>
                <IonItem>
                    <div className="label3"><IonLabel>Servicii: </IonLabel></div>
                    <IonInput
                        className="inputField"
                        value={servicii}
                        onIonChange={(e) => setServicii(e.detail.value || "")}
                    />
                </IonItem>
                <IonItem>
                    <div className="label4"><IonLabel>Nr. persoane: </IonLabel></div>
                    <IonInput
                        className="inputField"
                        value={nrPersoane}
                        onIonChange={(e) => setNrPersoane(Number(e.detail.value))}
                    />
                </IonItem>
                <IonItem>
                    <div className="label5"><IonLabel>Nume: </IonLabel></div>
                    <IonInput
                        className="inputField"
                        value={nume}
                        onIonChange={(e) => setNume(e.detail.value || "")}
                    />
                </IonItem>
                <div className="checkBox">
                <IonItem>
                    <IonLabel>Ocupat: </IonLabel>
                    <IonCheckbox
                        checked={ocupat}
                        onIonChange={(e) => setOcupat(e.detail.checked)}
                    />
                </IonItem>
                </div>

                {beauty2 && (
                    <>
                    <IonItem>
                        <IonLabel>Data(LL/ZZ/AAAA): </IonLabel>
                        <IonInput
                            className="inputField"
                            value={beauty2.data}
                            onIonChange={(e) => setData(e.detail.value || "")}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel>Ora(HH:mm): </IonLabel>
                        <IonInput
                            className="inputField"
                            value={beauty2.ora}
                            onIonChange={(e) => setOra(e.detail.value || "")}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel>Servicii: </IonLabel>
                        <IonInput
                            className="inputField"
                            value={beauty2.servicii}
                            onIonChange={(e) => setServicii(e.detail.value || "")}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel>Nr. persoane: </IonLabel>
                        <IonInput
                            className="inputField"
                            value={beauty2.nrPersoane}
                            onIonChange={(e) => setNrPersoane(Number(e.detail.value))}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel>Nume: </IonLabel>
                        <IonInput
                            className="inputField"
                            value={beauty2.nume}
                            onIonChange={(e) => setNume(e.detail.value || "")}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel>Ocupat: </IonLabel>
                        <IonCheckbox
                            checked={beauty2.ocupat}
                            onIonChange={(e) => setOcupat(e.detail.checked)}
                        />
                    </IonItem>
                    </>
                )}
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save beauty'}</div>
                )}
                <IonImg
                    style={{width: "600px", height: "600px", margin: "0 auto"}}
                    alt={"No photo"}
                    src={photoPath}
                />
                <MyMap
                    lat={latitude}
                    lng={longitude}
                    onMapClick={(location: any) => {
                        setLatitude(location.latLng.lat());
                        setLongitude(location.latLng.lng());
                    }}
                />
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton
                        onClick={() => {
                            const photoTaken = takePhoto();
                            photoTaken.then((data) => {
                                setPhotoPath(data.webviewPath!);
                            });
                        }}
                    >
                        <IonIcon icon={camera}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};
export default BeautyEdit;

