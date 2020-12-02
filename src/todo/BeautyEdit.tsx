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
    IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { BeautyContext } from './BeautyProvider';
import { RouteComponentProps } from 'react-router';
import { BeautyProps } from './BeautyProps';

const log = getLogger('BeautyEdit');

interface BeautyEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const BeautyEdit: React.FC<BeautyEditProps> = ({ history, match }) => {
    const { beauties, saving, savingError, saveBeauty, deleteBeauty } = useContext(BeautyContext);
    const [data, setData] = useState('');
    const [ora, setOra] = useState('');
    const [servicii, setServicii] = useState('');
    const [nrPersoane, setNrPersoane] = useState(0);
    const [nume, setNume] = useState('');
    const [ocupat, setOcupat] = useState(false);
    const [beauty, setBeauty] = useState<BeautyProps>();
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
        }
    }, [match.params.id, beauties]);
    const handleSave = () => {
        const editedBeauty = beauty
            ? { ...beauty, data,ora,servicii,nrPersoane,nume,ocupat }
            : { data,ora,servicii,nrPersoane,nume,ocupat };
        saveBeauty && saveBeauty(editedBeauty).then(() => history.goBack());
    };
    const handleDelete = () => {
        const editedBeauty = beauty
            ? { ...beauty, data,ora,servicii,nrPersoane,nume,ocupat }
            : { data,ora,servicii,nrPersoane,nume,ocupat };
        deleteBeauty && deleteBeauty(editedBeauty).then(() => history.goBack());
    };
    log('render');
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
                    <IonLabel>Data(LL/ZZ/AAAA): </IonLabel>
                    <IonInput
                        className="inputField"
                        value={data}
                        onIonChange={(e) => setData(e.detail.value || "")}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Ora(HH:mm): </IonLabel>
                    <IonInput
                        className="inputField"
                        value={ora}
                        onIonChange={(e) => setOra(e.detail.value || "")}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Servicii: </IonLabel>
                    <IonInput
                        className="inputField"
                        value={servicii}
                        onIonChange={(e) => setServicii(e.detail.value || "")}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Nr. persoane: </IonLabel>
                    <IonInput
                        className="inputField"
                        value={nrPersoane}
                        onIonChange={(e) => setNrPersoane(Number(e.detail.value))}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Nume: </IonLabel>
                    <IonInput
                        className="inputField"
                        value={nume}
                        onIonChange={(e) => setNume(e.detail.value || "")}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Ocupat: </IonLabel>
                    <IonCheckbox
                        checked={ocupat}
                        onIonChange={(e) => setOcupat(e.detail.checked)}
                    />
                </IonItem>
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save beauty'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};
export default BeautyEdit;

// import React, { useContext, useEffect, useState } from 'react';
// import {
//     IonButton,
//     IonButtons,
//     IonContent,
//     IonHeader,
//     IonInput,
//     IonItem,
//     IonCheckbox,
//     IonLoading,
//     IonPage,
//     IonTitle,
//     IonToolbar,
//     IonLabel
// } from '@ionic/react';
// import { getLogger } from '../core';
// import { BeautyContext } from './BeautyProvider';
// import { RouteComponentProps } from 'react-router';
// import { BeautyProps } from './BeautyProps';
// //import set = Reflect.set;
//
// const log = getLogger('BeautyEdit');
//
// interface ItemEditProps extends RouteComponentProps<{
//     id?: string;
// }> {}
//
// const BeautyEdit: React.FC<ItemEditProps> = ({ history, match }) => {
//     const { items, saving, savingError, saveItem } = useContext(ItemContext);
//     //const [text, setText] = useState('');
//     const [data, setData] = useState('');
//     const [ora, setOra] = useState('');
//     const [serv, setServ] = useState('');
//     const [nrPer, setNrP] = useState('')
//     const [num, setNum] = useState('');
//     const [lib, setLib] = useState('');
//     const [item, setItem] = useState<BeautyProps>();
//     useEffect(() => {
//         log('useEffect');
//         const routeId = match.params.id || '';
//         const item = items?.find(it => it.id === routeId);
//         setItem(item);
//         if (item) {
//             setData(item.data);
//             setOra(item.ora);
//             setServ(item.serv);
//             setNrP(item.nrPer);
//             setNum(item.num);
//             setLib(item.lib);
//         }
//     }, [match.params.id, items]);
//     const handleSave = () => {
//         const editedItem = item ? { ...item, data, ora, serv, nrPer , num, lib } : { data,ora,serv,nrPer,num,lib };
//         saveItem && saveItem(editedItem).then(() => history.goBack());
//     };
//     log('render');
//     return (
//         <IonPage>
//             <IonHeader>
//                 <IonToolbar>
//                     <IonTitle>Edit</IonTitle>
//                     <IonButtons slot="end">
//                         <IonButton onClick={handleSave}>
//                             Save
//                         </IonButton>
//                     </IonButtons>
//                 </IonToolbar>
//             </IonHeader>
//             <IonContent>
//                 <IonLabel>Data(LL/ZZ/AAAA) -> <IonInput value={data} onIonChange={e=>setData(e.detail.value || '')}/></IonLabel><br/>
//                 <IonLabel>Ora(HH:MM) -> <IonInput value={ora} onIonChange={e=>setOra(e.detail.value || '')}/></IonLabel><br/>
//                 <IonLabel>Serviciul -> <IonInput value={serv} onIonChange={e=>setServ(e.detail.value || '')}/></IonLabel><br/>
//                 <IonLabel>Numarul Persoanelor -> <IonInput value={nrPer} onIonChange={e=>setNrP(e.detail.value || '')}/></IonLabel><br/>
//                 <IonLabel>Numele -> <IonInput value={num} onIonChange={e=>setNum(e.detail.value || '')}/></IonLabel><br/>
//                 <IonLabel>Liber(True/False) -> <IonInput value={lib} onIonChange={e=>setLib(e.detail.value || '')}/></IonLabel><br/>
//                 <IonLoading isOpen={saving} />
//                 {savingError && (
//                     <div>{savingError.message || 'Failed to save item'}</div>
//                 )}
//             </IonContent>
//         </IonPage>
//     );
// };
//
// export default BeautyEdit;
