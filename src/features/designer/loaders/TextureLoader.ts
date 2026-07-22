export type TextureLoadResult = {
  path: string;
  type: "texture";
};

export async function loadTexture(path: string): Promise<TextureLoadResult> {
  return {
    path,
    type: "texture",
  };
}
