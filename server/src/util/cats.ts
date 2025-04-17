const CAT_URL = "https://cataas.com/cat?width=128&height=128&json=true";

// requests a cat json object from CAT_URL
export async function acquireCat(): Promise<string | undefined> {
  // make the fetch call
  const response = await fetch(CAT_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const json: unknown = await response.json();
  if (json instanceof Object && "url" in json) {
    return json.url as string;
  }
  return undefined;
}
