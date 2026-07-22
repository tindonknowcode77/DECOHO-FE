export type ModelLoadResult = {
  path: string;
  type: "model";
};

export async function loadModel(path: string): Promise<ModelLoadResult> {
  return {
    path,
    type: "model",
  };
}
