import React from 'react';
import { IonItem, IonLabel, IonDatetime, IonInput } from '@ionic/react';
import { BeautyProps } from './BeautyProps';
import {text} from "ionicons/icons";

interface BeautyPropsExt extends BeautyProps {
    onEdit: (id?: string) => void;
}

const Beauty: React.FC<BeautyPropsExt> = ({ _id, data,ora, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel>Data->    {data}</IonLabel><br />
            <IonLabel>Ora->    {ora}</IonLabel><br />
        </IonItem>
    );
};

export default Beauty;
