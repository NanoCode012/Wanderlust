import React, {useState} from 'react';
import * as ImagePicker from 'expo-image-picker';
import Button from './Button';
import Text from './Text';
import {useTheme, useTranslation} from '../hooks';

interface IImageSelector {
    disabled: boolean;
    setSelectedImageBase64: (base64: string) => void;
}

const ImageSelector = ({disabled, setSelectedImageBase64}: IImageSelector) => {
    const [selectedImageURI, setSelectedImageURI] = useState(false);
    const {t} = useTranslation();
    const {gradients, sizes} = useTheme();

    const openImagePickerAsync = async () => {
        const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert('Permission to access camera roll is required!');
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            base64: true,
            exif: false,
        });

        if (pickerResult.cancelled === true) {
            return;
        }

        if (!pickerResult.base64) return;

        setSelectedImageBase64(pickerResult.base64);
        setSelectedImageURI(true);
    };

    return (
        <Button
            onPress={openImagePickerAsync}
            flex={1}
            gradient={selectedImageURI ? gradients.success : gradients.info}
            marginBottom={sizes.base}
            paddingHorizontal={sizes.xl}
            paddingVertical={sizes.s}
            disabled={disabled}>
            <Text p bold transform="uppercase">
                {t('home.createPost.uploadPhoto')}
            </Text>
        </Button>
    );
};

export default ImageSelector;
