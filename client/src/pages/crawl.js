import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'prismjs/themes/prism.css';
import { supabase } from '../api/supabaseClient';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { FaRegSave, FaCheckCircle } from "react-icons/fa";

const URLChecker = () => {

  const [openTitle, setOpenTitle] = useState(false)
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [replyAiTitle, setReplyAiTitle] = useState('');
  const [replyUrl, setReplyUrl] = useState('');
  const [replyCrawlContent, setReplyCrawlContent] = useState('');
  const [replyAiSuggestion, setReplyAiSuggestion] = useState('');
  const [midData, setMidData] = useState([]);

  const validateInputs = (niche, location, siteUrl) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const targetSiteUrl = siteUrl.match(urlPattern);
    if (!niche.trim()) return 'Niche is required!';
    if (!location.trim()) return 'Location is required!';
    if (!targetSiteUrl) return 'Invalid Site URL!';
    return '';
  };

  const newGenerate = async () => {
    const error = validateInputs(niche, location, siteUrl);
    if (error) {
      setErrorMsg(error);
      return;
    }

    try {
      setErrorMsg('');
      setNiche('');
      setLocation('');
      setSiteUrl('');
      setOpen(false);

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/ai/title`,
        { niche, location, targetSiteUrl: siteUrl.match(/https?:\/\/[^\s]+/) }
      );

      setMidData(prev => [...prev, data]);
      setReplyAiTitle(data.aiData);
      setReplyUrl(data.targetSiteUrl[0]);
      setReplyCrawlContent(data.crawlData);
      setReplyAiSuggestion(data.seoContent?.content);
    } catch (error) {
      console.error("Error fetching AI data:", error);
      setErrorMsg('An error occurred while fetching AI suggestions.');
    }
  };

  const cancelModal = () => {
    setNiche('');
    setLocation('');
    setSiteUrl('');
    setOpen(false);
  };

  useEffect(() => {
    if (message || errorMsg) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setMessage('');
        setErrorMsg('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, errorMsg]);

  const suggestionLines = replyAiSuggestion.trim().split('\n');

  const contentSave = async (index) => {
    const dataToSave = midData[index];
    if (!dataToSave) return;

    try {
      const { data, error } = await supabase
        .from('suggestion')
        .insert([{
          aiTitle: dataToSave.aiData,
          seoContent: dataToSave.seoContent?.content,
          crawlContent: dataToSave.crawlData,
          url: dataToSave.targetSiteUrl
        }]);

      if (error) {
        console.error("Error saving data:", error);
      } else {
        console.log("Saved data:", data);
      }
    } catch (err) {
      console.error("Error saving content to Supabase:", err);
    }
  };

  const formatHTML = (html) => {
    const tab = '\t';
    let result = '';
    let indent = '';

    html.split(/>\s*</).forEach(function (element) {
      if (element.match(/^\/\w/)) indent = indent.substring(tab.length);
      result += indent + '<' + element + '>\r\n';
      if (element.match(/^<?\w[^>]*[^\/]$/)) indent += tab;
    });

    return result.substring(1, result.length - 3);
  };

  return (
    <>
      <div className='w-full overflow-auto h-screen'>
        <div className='pt-12 px-8'>
          <div className='text-center text-2xl font-bold'>
            Website Crawl & SEO Proposal
          </div>

          <div className='mt-4'>
            <div className='flex px-4 justify-between' >
              <div className="block text-lg font-bold leading-6 text-gray-900">
                Crawl & Proposal List :
              </div>
              <div className='flex gap-2 justify-between'>
                <button
                  onClick={() => setOpen(true)}
                  type="button"
                  className="border-[1px] border-indigo-600 float-right rounded bg-indigo-600 px-4 py-1 text-xs font-semibold text-white shadow-sm hover:bg-white hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  ADD
                </button>
              </div>
            </div>

            <div className="App mt-4 p-2">
              <div className=" min-w-full text-center p-2 divide-y divide-gray-300" >

                <div className='flex justify-between text-md pb-2 text-gray-900 divide-x  divide-gray-300'>
                  <div className="p-2  w-[10%]  ">No</div>
                  <div className="p-2  w-[20%] ">Suggested Title</div>
                  <div className="p-2  w-[10%]">Site url</div>
                  <div className="p-2  w-[25%]">Website Crawl Content</div>
                  <div className="p-2  w-[25%]">SEO Proposal</div>
                  <div className="p-2  w-[10%]">Action</div>
                </div>

                <div className='py-2 '>
                  {midData.length ? (
                    midData?.map((item, key) => (
                      <div className="flex justify-between text-center hover:bg-slate-100 hover:cursor-pointer whitespace-nowrap text-sm text-gray-900 py-2 border-b-[1px] border-b-gray-300">
                        <div className=" w-[10%] ">{key + 1}</div>
                        <div className=" w-[20%] ">{item.aiData}</div>
                        <div className=" w-[10%]" >{item.targetSiteUrl}</div>

                        {
                          item.crawlData ? (
                            <div className=" overflow-x-auto w-[25%] tracking-widest font-semibold">
                              <div className='flex gap-2 justify-center items-center'>
                                success
                                <FaCheckCircle className='text-green-500' />
                              </div>
                            </div>
                          ) : (
                            <div className=" overflow-x-auto w-[25%] tracking-widest font-semibold"></div>
                          )
                        }

                        {
                          item.seoContent ? (
                            <div className=" overflow-x-auto w-[25%] tracking-widest font-semibold">
                              <div className='flex gap-2 justify-center items-center'>
                                success
                                <FaCheckCircle className='text-green-500' />
                              </div>
                            </div>
                          ) : (
                            <div className=" overflow-x-auto w-[25%] tracking-widest font-semibold"></div>
                          )
                        }

                        <div className=" w-[10%] text-center flex justify-center items-center gap-2">
                          <FaRegSave
                            onClick={() => contentSave(key)}
                            className="w-5 h-5 text-red-400 hover:text-indigo-800"
                          />
                          {/* <IoIosSend
                            className="w-6 h-6 text-red-400 hover:text-indigo-800"
                          /> */}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='font-bold text-lg p-10 text-center border-b-[1px] border-b-gray-300'>
                      No Data
                    </div>
                  )

                  }
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className='px-10 mt-2'>
          <div className='flex justify-between'>
            <div className='w-[20%] block text-lg font-bold leading-6 text-gray-900' > Suggested Data </div>
            <div className='w-[50%] text-center'>
              Suggested Title : {replyAiTitle}
            </div>
            <div className='w-[20%]'>
            </div>
          </div>

          <div className='flex gap-10 mt-4 w-[100%]'>
            <div className='w-1/2'>
              <p className='text-center my-4 text-md font-semibold'>
                Web Crawl
              </p>
              <div className="p-2 overflow-auto border-[1px] border-gray-300 rounded-md"
                style={{ height: 'calc(100vh - 29rem)' }}
              >
                <pre className='whitespace-pre-wrap'>
                  <code className='javascript-language'>
                    <div className='break-all  text-md font-100'>
                      {formatHTML(replyCrawlContent)}
                    </div>
                  </code>
                </pre>
              </div>
            </div>

            <div className='w-1/2'>
              <div className='my-4'>
                <p className='text-center  text-md font-semibold'>
                  AI Proposal
                </p>
              </div>
              <div className=' overflow-auto border-[1px] border-gray-300 rounded-md p-4 text-md font-semibold'
                style={{ height: 'calc(100vh - 29rem)' }}
              >
                {suggestionLines.map((line, index) => (
                  <p key={index} className='my-1'>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Dialog open={open} onClose={setOpen} className="relative z-10">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          />
          <div className="fixed inset-0 z-10 w-full overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel
                transition
                className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-[40%] sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
              >
                <div className="text-center text-lg font-semibold">
                  Add new Item
                </div>

                <div className="h-[10px] mt-[10px]">
                  {isVisible && <h1 className="text-red-500 text-center">{errorMsg}</h1>}
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex gap-4 w-full justify-center items-center">
                    <label className="block w-[35%] text-sm font-medium leading-6 text-gray-900">
                      Comapny Niche
                    </label>

                    <input
                      onChange={(e) => setNiche(e.target.value)}
                      type="text"
                      placeholder="company niche..."
                      className="block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>

                  <div className="flex gap-4 w-full justify-center items-center">
                    <label className="block w-[35%] text-sm font-medium leading-6 text-gray-900">
                      Company Location
                    </label>

                    <input
                      onChange={(e) => setLocation(e.target.value)}

                      type="text"
                      placeholder="company location..."
                      className="block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>

                  <div className="flex gap-4 w-full justify-center items-center">
                    <label className="block w-[35%] text-sm font-medium leading-6 text-gray-900">
                      Company Site
                    </label>

                    <input
                      onChange={(e) => setSiteUrl(e.target.value)}
                      type="text"
                      placeholder="company site url..."
                      className="block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>

                </div>

                <div className="mt-5 sm:mt-6 flex gap-2 justify-between">
                  <button
                    type="button"
                    onClick={() => cancelModal()}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => newGenerate()}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Generate
                  </button>

                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>

        <Dialog open={openTitle} onClose={setOpenTitle} className="relative z-10">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          />
          <div className="fixed inset-0 z-10 w-full overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel
                transition
                className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-[40%] sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
              >
                <div>
                  Do you want create the Title by AI.
                </div>

                <div className="mt-5 sm:mt-6 flex gap-2 justify-between">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Confirm
                  </button>
                </div>

              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </div >
    </>
  );
};

export default URLChecker
