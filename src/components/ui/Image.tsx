import {
  Image as ExpoImage,
  type ImageProps as ExpoImageProps,
} from "expo-image";

export type ImageProps = ExpoImageProps;

function ImageBase(props: ImageProps) {
  return <ExpoImage {...props} />;
}

type ImageStatics = Pick<
  typeof ExpoImage,
  | "prefetch"
  | "clearMemoryCache"
  | "clearDiskCache"
  | "getCachePathAsync"
  | "generateBlurhashAsync"
  | "loadAsync"
>;

export const Image: typeof ImageBase & ImageStatics = Object.assign(ImageBase, {
  prefetch: ExpoImage.prefetch.bind(ExpoImage),
  clearMemoryCache: ExpoImage.clearMemoryCache.bind(ExpoImage),
  clearDiskCache: ExpoImage.clearDiskCache.bind(ExpoImage),
  getCachePathAsync: ExpoImage.getCachePathAsync.bind(ExpoImage),
  generateBlurhashAsync: ExpoImage.generateBlurhashAsync.bind(ExpoImage),
  loadAsync: ExpoImage.loadAsync.bind(ExpoImage),
});
