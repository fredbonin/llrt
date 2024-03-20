describe("Headers", () => {
  it("should construct a new Headers object with the provided headers", () => {
    const headers = { "content-type": "application/json" };
    const h = new Headers(headers);
    expect(h.get("Content-Type")).toEqual(headers["content-type"])
  });

  it("should add headers to the Headers object", () => {
    const h = new Headers();
    h.set("Content-Type", "application/json");
    expect(h.get("Content-Type")).toEqual("application/json")
  });

  it("should overwrite headers in the Headers object", () => {
    const headers = { "Content-Type": "application/json" };
    const h = new Headers(headers);
    h.set("Content-Type", "text/plain");
    expect(h.get("Content-Type")).toEqual("text/plain")
  });

  it("should delete headers from the Headers object", () => {
    const headers = { "Content-Type": "application/json" };
    const h = new Headers(headers);
    h.delete("Content-Type");
    expect(h.get("Content-Type")).toEqual(undefined)
  });

  it("should return an iterator over the headers", () => {
    const headers = {
      "content-type": "application/json",
      authorization: "Bearer 1234",
    };
    const h = new Headers(headers);
    const iterator = h.entries();
    let next = iterator.next();
    assert.deepStrictEqual(next.value, ["authorization", "Bearer 1234"]);
    next = iterator.next();
    assert.deepStrictEqual(next.value, ["content-type", "application/json"]);
    next = iterator.next();
    assert.deepStrictEqual(next.value, undefined);
  });

  it("should iterate over the headers with forEach", () => {
    const headers = {
      "content-type": "application/json",
    };
    const h = new Headers(headers);
    h.forEach((value, key) => {
      assert.deepStrictEqual(key, "content-type");
      assert.deepStrictEqual(value, "application/json");
    });
  });
});

describe("Request", () => {
  it("should construct a new Request object with the provided URL", () => {
    const url = "https://example.com";
    const request = new Request(url);
    expect(request.url).toEqual(url)
  });

  it("should set the method to GET by default", () => {
    const request = new Request("https://example.com");
    expect(request.method).toEqual("GET")
  });

  it("should set the method to the provided value", () => {
    const method = "POST";
    const request = new Request("https://example.com", { method });
    expect(request.method).toEqual(method)
  });

  it("should set the headers to an empty object by default", () => {
    const request = new Request("https://example.com");
    const headers = new Headers();
    assert.deepEqual(request.headers.entries(), headers.entries());
  });

  it("should set the headers to the provided value", () => {
    const headers = { "Content-Type": "application/json" };
    const headerValue = new Headers(headers);
    const request = new Request("https://example.com", { headers });
    assert.deepStrictEqual(request.headers, headerValue);
  });

  it("should set the body to null by default", () => {
    const request = new Request("https://example.com");
    expect(request.body).toEqual(null)
  });

  it("should set the body to the provided value", () => {
    const body = "hello world!";
    const request = new Request("https://example.com", {
      body,
      method: "POST",
    });
    assert.deepStrictEqual(request.body, body);
  });

  it("should set the body to a Blob if a Blob is provided", async () => {
    const blob = new Blob(["Hello, world!"], { type: "text/plain" });
    const request = new Request("https://example.com", {
      body: blob,
      method: "POST",
    });
    assert.deepStrictEqual(
      request.body,
      new Uint8Array(await blob.arrayBuffer())
    );
  });

  it("should accept another request object as argument", () => {
    const oldRequest = new Request("https://example.com", {
      headers: { From: "webmaster@example.org" },
    });
    assert.equal(oldRequest.headers.get("From"), "webmaster@example.org");
    const newRequest = new Request(oldRequest, {
      headers: { From: "developer@example.org" },
    });
    assert.equal(newRequest.url, "https://example.com");
    assert.equal(newRequest.headers.get("From"), "developer@example.org");
  });
});

describe("Response class", () => {
  it("should construct a new Response object with default values", () => {
    const response = new Response();
    expect(response.status).toEqual(200)
    expect(response.statusText).toEqual("OK")
    assert.ok(response.headers instanceof Headers);
    expect(response.body).toEqual(null)
  });

  it("should set the status and statusText to the provided values", () => {
    const response = new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
    expect(response.status).toEqual(404)
    expect(response.statusText).toEqual("Not Found")
  });

  it("should set the headers to the provided value", () => {
    const headers = new Headers({ "Content-Type": "application/json" });
    const response = new Response(null, { headers });

    assert.deepStrictEqual(
      response.headers.get("Content-Type"),
      "application/json"
    );
  });

  it("should set the body to the provided value", async () => {
    const body = "Hello, world!";
    const response = new Response(body);
    assert.deepStrictEqual(await response.text(), body);
  });

  it("should set the body to a Blob if a Blob is provided", async () => {
    const blob = new Blob(["Hello, world!"], { type: "text/plain" });
    const response = new Response(blob);

    expect(await response.text()).toEqual("Hello, world!")
  });

  it("should set the body to a JSON object if a JSON object is provided", () => {
    const jsonBody = { key: "value" };
    const response = new Response(JSON.stringify(jsonBody), {
      headers: { "Content-Type": "application/json" },
    });
    return response.json().then((parsedJson) => {
      assert.deepStrictEqual(parsedJson, jsonBody);
    });
  });

  it("should clone the response with the clone() method", () => {
    const response = new Response("Original response");
    const clonedResponse = response.clone();
    assert.deepEqual(response.body, clonedResponse.body);
    assert.equal(response.url, clonedResponse.url);
    assert.equal(response.status, clonedResponse.status);
    assert.equal(response.statusText, clonedResponse.statusText);
    assert.deepEqual(response.headers, clonedResponse.headers);
    assert.equal(response.type, clonedResponse.type);
    assert.equal(response.ok, clonedResponse.ok);
    assert.equal(response.bodyUsed, clonedResponse.bodyUsed);
  });

  it("should create a Response object with an ok status for status codes in the range 200-299", () => {
    const response = new Response("Success", { status: 204 });
    assert.ok(response.ok);
  });

  it("should create a Response object with not-ok status for status codes outside the range 200-299", () => {
    const response = new Response("Error", { status: 404 });
    assert.ok(!response.ok);
  });
});

describe("URL class", () => {
  it("should parse a valid URL", () => {
    const url = new URL("https://www.example.com");
    expect(url.protocol).toEqual("https:")
    expect(url.hostname).toEqual("www.example.com")
  });

  it("should create a copy of a valid URL", () => {
    const url: any = new URL("https://www.example.com");
    const url2 = new URL(url);
    assert.notEqual(url, url2);
  });

  it("should to append base to a url", () => {
    const url = new URL("/base", "https://www.example.com");
    assert.equal(url.toString(), "https://www.example.com/base");
  });

  it("should throw an error for an invalid URL", () => {
    assert.throws(() => {
      new URL("not-a-url");
    }, /Invalid URL/);
  });

  it("should return the URL as a string", () => {
    const url = new URL("https://www.example.com");
    expect(url.toString()).toEqual("https://www.example.com/")
  });

  it("should parse query parameters", () => {
    const url = new URL("https://www.example.com/?foo=bar&baz=qux");
    expect(url.searchParams.get("foo")).toEqual("bar")
    expect(url.searchParams.get("baz")).toEqual("qux")
  });

  it("should be able to set and get port", () => {
    const url: any = new URL("https://www.example.com");
    url.port = "1234";
    expect(url.toString()).toEqual("https://www.example.com:1234/")
    url.port = 5678;
    expect(url.toString()).toEqual("https://www.example.com:5678/")
  });

  it("should modify query parameters", () => {
    const url = new URL("https://www.example.com/?foo=bar&baz=qux");
    url.searchParams.set("foo", "new-value");
    expect(url.toString()).toEqual("https://www.example.com/?baz=qux&foo=new-value")
  });
  it("should parse username and password", () => {
    const url = new URL(
      "https://anonymous:flabada@developer.mozilla.org/en-US/docs/Web/API/URL/username"
    );
    expect(url.username).toEqual("anonymous")
    expect(url.password).toEqual("flabada")
  });
  it("should provide can_parse util", () => {
    const valid_url = "https://www.example.com/";
    const invalid_url = "not_a_valid_url";
    expect(URL.canParse(valid_url)).toEqual(true)
    expect(URL.canParse(invalid_url)).toEqual(false)
  });
});

describe("URLSearchParams class", () => {
  it("should have a parameter if it exists", () => {
    const paramsString = "topic=api&a=1&a=2&a=3";
    const searchParams = new URLSearchParams(paramsString);
    assert.ok(searchParams.has("topic"));
  });

  it("should not have a parameter if it doesn't exist", () => {
    const paramsString = "topic=api&a=1&a=2&a=3";
    const searchParams = new URLSearchParams(paramsString);
    assert.ok(!searchParams.has("foo"));
  });

  it("should return the value of the parameter if it exists", () => {
    const paramsString = "topic=api&a=1&a=2&a=3";
    const searchParams = new URLSearchParams(paramsString);
    assert.ok(searchParams.get("topic") === "api");
  });

  it("should return null if the parameter doesn't exist", () => {
    const paramsString = "topic=api&a=1&a=2&a=3";
    const searchParams = new URLSearchParams(paramsString);
    assert.equal(searchParams.get("foo"), null);
  });

  it("should return an array of all values of the parameter if it exists", () => {
    const paramsString = "topic=api&a=1&a=2&a=3";
    const searchParams = new URLSearchParams(paramsString);
    assert.deepEqual(searchParams.getAll("a"), ["1", "2", "3"]);
  });

  it("should return an empty array if the parameter doesn't exist", () => {
    const paramsString = "topic=api&a=1&a=2&a=3";
    const searchParams = new URLSearchParams(paramsString);
    assert.deepEqual(searchParams.getAll("foo"), []);
  });

  it("should add the parameter to the end of the query string", () => {
    const paramsString = "topic=api&a=1&a=2&a=3";
    const searchParams = new URLSearchParams(paramsString);
    searchParams.append("topic", "webdev");
    assert.equal(searchParams.toString(), "a=1&a=2&a=3&topic=api&topic=webdev");
  });

  it("should replace all values of the parameter with the given value", () => {
    const paramsString = "topic=api&a=1&a=2&a=3";
    const searchParams = new URLSearchParams(paramsString);
    searchParams.set("topic", "More webdev");
    assert.equal(searchParams.toString(), "a=1&a=2&a=3&topic=More+webdev");
  });

  it("should remove the parameter from the query string", () => {
    const paramsString = "topic=api&a=1&a=2&a=3";
    const searchParams = new URLSearchParams(paramsString);
    searchParams.delete("topic");
    assert.equal(searchParams.toString(), "a=1&a=2&a=3");
  });

  it("should iterate over all parameters in the query string", () => {
    const paramsString = "topic=api&a=1&a=2&a=3";
    const searchParams = new URLSearchParams(paramsString);
    let arr: [string, string][] = [];
    for (const p of searchParams) {
      arr.push(p);
    }
    assert.deepEqual(arr, [
      ["a", "1"],
      ["a", "2"],
      ["a", "3"],
      ["topic", "api"],
    ]);
  });
});

describe("Blob class", () => {
  it("should construct a new Blob object with the provided data and options", () => {
    const blobData = ["Hello, world!"];
    const blobOptions = { type: "text/plain" };
    const blob = new Blob(blobData, blobOptions);

    expect(blob.size).toEqual(blobData[0].length)
    expect(blob.type).toEqual(blobOptions.type)
  });

  it("should create a Blob with default type if options.type is not provided", () => {
    const blobData = ["Hello, world!"];
    const blob = new Blob(blobData);

    expect(blob.size).toEqual(blobData[0].length)
    expect(blob.type).toEqual("")
  });

  it("should create a Blob with an empty array if no data is provided", () => {
    // @ts-ignore
    const blob = new Blob();

    expect(blob.size).toEqual(0)
    expect(blob.type).toEqual("")
  });

  it("should handle line endings properly", async () => {
    const text = "This\r\n is a \ntest\r\n string";

    // @ts-ignore
    const blob = new Blob([text], {
      // @ts-ignore
      endings: "native",
    });

    expect(blob.type).toEqual("")
    if (process.platform != "win32") {
      assert.ok(blob.size < text.length);
      expect(await blob.text()).toEqual(text.replace(/\r\n/g, "\n"))
    }
  });

  it("should return an ArrayBuffer with the arrayBuffer() method", async () => {
    const blobData = ["Hello, world!"];
    const blob = new Blob(blobData, { type: "text/plain" });

    const arrayBuffer = await blob.arrayBuffer();

    assert.ok(arrayBuffer instanceof ArrayBuffer);
  });

  it("should return a DataView with the slice method", () => {
    const blobData = ["Hello, world!"];
    const blob = new Blob(blobData, { type: "text/plain" });

    const slicedBlob = blob.slice(0, 5, "text/plain");

    assert.ok(slicedBlob instanceof Blob);
    expect(slicedBlob.size).toEqual(5)
    expect(slicedBlob.type).toEqual("text/plain")
  });
});
