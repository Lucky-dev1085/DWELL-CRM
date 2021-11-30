import { toast, ToastOptions } from 'react-toastify';
import { imageCompressOption, toastError } from 'site/constants';
import { CustomBlob } from 'src/interfaces';
import ImageCompressor from 'image-compressor.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
const defaultUploadSuccess = (...params) => { };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FileUploadCallback = (...params: any) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const handleFileUpload = (uploadImage: any, file: File | File[], name = '', fileUploadSuccessCB: FileUploadCallback = defaultUploadSuccess, ...rest: any): Promise<string> => {
  const imageCompressor = new ImageCompressor();
  const blob = new Blob([file[0]], { type: file[0].type }) as CustomBlob;
  blob.name = file[0].name.replace(/\s|\(|\)/g, '');
  return imageCompressor.compress(blob, imageCompressOption)
    .then(result => uploadImage(result, response => fileUploadSuccessCB(response, name, ...rest))).then(({ result: { data: { url } } }) => url)
    .catch(() => toast.error('Sorry but we could not compress given image.', toastError as ToastOptions));
};
