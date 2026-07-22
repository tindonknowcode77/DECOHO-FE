export type GLTFLoadResult = {
  path: string;
  type: "gltf";
};

export async function loadGLTF(path: string): Promise<GLTFLoadResult> {
  return {
    path,
    type: "gltf",
  };
}
