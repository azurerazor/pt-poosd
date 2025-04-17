const CAT_URL = "https://cataas.com/cat?width=128&height=128&json=true";

// requests a cat json object from https://cataas.com/cat?width=500&height=500&json=true
export async function acquireCat(): Promise<string> {
  // make the fetch call
  const response = await fetch(CAT_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const json: any = await response.json();
  return json.url as string;
}
