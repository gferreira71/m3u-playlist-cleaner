import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function isServerUp(): Promise<boolean> {
  try {
    await apiClient.get("/health");
    return true;
  } catch (error) {
    return false;
  }
}

export async function getFileContent(url: string): Promise<File> {
  try {
    const response = await apiClient
      .get("/get-file", { params: { url }, responseType: "blob" })
      .catch((error) => {
        throw new Error("Failed to fetch file from the provided URL.");
      });
    const blob = response.data;
    const filename = response.headers["x-filename"] || "downloaded-file";
    const contentType =
      response.headers["content-type"] || "application/octet-stream";
    const file = new File([blob], filename || "downloaded-file", {
      type: contentType,
    });

    return file;
  } catch (error) {
    throw new Error("Failed to fetch and convert file from the provided URL.");
  }
}

export default { getFileContent, isServerUp };
