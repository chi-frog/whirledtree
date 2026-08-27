export async function fileExists(url: string) {
  const response = await fetch(url, {
    method: "HEAD",
  });

  return response.ok;
};