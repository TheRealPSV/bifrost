import { useState, useEffect } from "react";
import { Animator, Text } from "@arwes/react";
import { DateTime } from "luxon";
import { Background } from "./component/Background"
import { Header } from "./component/Header"
import { Button } from "./component/Button"
import axios from "axios";

import "./css/App.scss";

import faviconUrl from "./img/favicon.png";

const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/i;

const defaultSearch = "Type here to go somewhere.";

const searchBaseUrl = import.meta.env.VITE_SEARCH_BASE_URL.endsWith("/") ? import.meta.env.VITE_SEARCH_BASE_URL : import.meta.env.VITE_SEARCH_BASE_URL + "/"; // "https://search.brave.com/"
const searchQueryPath = import.meta.env.VITE_SEARCH_QUERY_PATH; // "search?q="
const searchHeaderText = import.meta.env.VITE_HEADER_TEXT || ""; //Search the Web
const titleText = import.meta.env.VITE_TITLE_TEXT || ""; //BIFROST
const apiHost = import.meta.env.VITE_API_HOST || ""; //for dev we want a value, but for prod we actually want this blank since the site is served with express static

const performSearch = function (query) {
  //in case of explicit search
  if (query.indexOf("?") === 0) {
    query = query.substring(1).trim();
  }

  query = encodeURIComponent(query);

  //implicit search (anything else)
  document.location.href =
    searchBaseUrl +
    searchQueryPath +
    query;
};

const concatenateClassNames = function (...classes) {
  let classValue = "";
  classes.forEach((value) => (classValue += value + " "));
  return classValue;
};

const handleQuery = function (query) {
  //explicit url
  if (urlRegex.test(query) && query.charAt(0) !== "?") {
    try {
      document.location.href = query;
    } catch (ex) {
      //search
      performSearch(query);
    }
  }
  //implicit url
  else if (
    urlRegex.test("http://" + query) &&
    query.indexOf(".") !== -1 &&
    query.indexOf(".") >= 2 &&
    query.indexOf(".") <= query.length - 3 &&
    query.indexOf("?") !== 0
  ) {
    //if adding http:// makes it valid, AND:
    // there is a '.' after the second char and it's before the last 2 chars, and the url doesn't have a '?' at beginning
    try {
      document.location.href = "http://" + query;
    } catch (ex) {
      //search
      performSearch(query);
    }
  } else {
    performSearch(query);
  }
};

export default function App() {
  const [searchText, setSearchText] = useState(defaultSearch);
  const [submitted, setSubmitted] = useState(false);
  const [opacityFadeClass, setOpacityFadeClass] = useState("fadeTransparent");
  const [textAlignClass, setTextAlignClass] = useState("textCenter");
  const [currentTime, setCurrentTime] = useState(DateTime.local());
  const [buttonData, setButtonData] = useState([]);

  const focusSearchbox = () => {
    if (searchText === defaultSearch) {
      setSearchText("");
    }
    setOpacityFadeClass("fadeOpaque");
    setTextAlignClass("textLeft");
  };

  const blurSearchbox = () => {
    if (
      searchText === defaultSearch || searchText.trim() === ""
    ) {
      setSearchText(defaultSearch);
      setTextAlignClass("textCenter");
      setOpacityFadeClass("fadeTransparent");
    }
  };

  const submitSearchbox = (e) => {
    e.preventDefault();
    let query = searchText.trim();
    setSubmitted(true);
    setTimeout(handleQuery, 1000, query);
  };

  const handleChange = (e) => {
    setSearchText(e.target.value);
  };

  const formatNow = (format) => {
    return currentTime.toFormat(format);
  };

  useEffect(() => {
    setInterval(() => setCurrentTime(DateTime.local()), 1000);
    document.title = titleText;
    document.getElementById("favicon").setAttribute("href", faviconUrl);
  }, []);

  useEffect(() => {
    async function fetchButtonData() {
      try {
        const fetchedData = await axios.get(`${apiHost}/fetchHosts`);
        const fetchedDataArray = fetchedData?.data ?? [];
        setButtonData(fetchedDataArray.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (e) {
        console.error(e);
      }
    }
    fetchButtonData();
  }, []);

  return (
    <div className="wrapper">
      <Background submitted={submitted} />
      <Header submitted={submitted} titleText={titleText} />
      <Animator duration={{ enter: 100 }}>
        <div>
          <h1>
            <Text>{searchHeaderText}</Text>
          </h1>
        </div>
      </Animator>
      <div className="maincontent">
        <Animator combine duration={{ enter: 100 }}>
          <form onSubmit={submitSearchbox}>
            <input
              onFocus={focusSearchbox}
              onBlur={blurSearchbox}
              onChange={handleChange}
              className={concatenateClassNames(
                opacityFadeClass,
                textAlignClass
              )}
              id="searchbox"
              type="text"
              name="searchText"
              size="25"
              value={searchText}
            />
          </form>
        </Animator>
        <Animator combine duration={{ enter: 10 }}>
          <div id="date">
            <Text as="span">{formatNow("cccc")}</Text>
            <span>,&nbsp;</span>
            <Text as="span">{formatNow("LLLL")}</Text>
            <span>&nbsp;</span>
            <Text as="span">{formatNow("dd")}</Text>
            <span>,&nbsp;</span>
            <Text as="span">{formatNow("yyyy")}</Text>
            <span>&nbsp;-&nbsp;</span>
            <Text as="span">{formatNow("HH")}</Text>
            <span>:</span>
            <Text as="span">{formatNow("mm")}</Text>
            <span>:</span>
            <Text as="span">{formatNow("ss")}</Text>
          </div>
        </Animator>
        <div className="buttoncontainer">
          {buttonData.map(d => <Button key={d.url} text={d.name} url={d.url} submitted={submitted} />)}
        </div>
      </div>
    </div>
  );
};
