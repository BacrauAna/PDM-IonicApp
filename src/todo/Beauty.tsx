import React, {useState} from 'react';
import { IonItem, IonLabel, IonImg, createAnimation, IonButton, IonModal } from '@ionic/react';
import { BeautyProps } from './BeautyProps';

interface BeautyPropsExt extends BeautyProps {
    onEdit: (id?: string) => void;
}

const Beauty: React.FC<BeautyPropsExt> = ({ _id, data,ora,photoPath, onEdit }) => {
    const [showModal, setShowModal] = useState(false);

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector("ion-backdrop")!)
            .fromTo("opacity", "0.01", "var(--backdrop-opacity)");

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector(".modal-wrapper")!)
            .keyframes([
                { offset: 0, opacity: "0", transform: "scale(0)" },
                { offset: 1, opacity: "0.99", transform: "scale(1)" },
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing("ease-out")
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    };

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction("reverse");
    };
    return (
        <IonItem>
            <IonLabel onClick={() => onEdit(_id)}>
                <IonLabel>Data->    {data}</IonLabel><br />
                <IonLabel>Ora->    {ora}</IonLabel><br />
            </IonLabel>
            <IonLabel>
                <IonImg
                    style={{width: "100px"}}
                    alt={"No Photo"}
                    src={photoPath}
                    onClick={() => {setShowModal(true);}}
                />
            </IonLabel>
            <IonModal
                isOpen={showModal}
                enterAnimation={enterAnimation}
                leaveAnimation={leaveAnimation}
            >
                <IonImg
                    alt={"No Photo"}
                    src={photoPath}
                    onClick={() => {setShowModal(true);}}
                />
                <IonButton onClick={() => setShowModal(false)}>Close Image</IonButton>
            </IonModal>
        </IonItem>
    );
};

export default Beauty;
