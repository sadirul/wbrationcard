import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import axios from "axios";

const CustomHelpers = () => {
    const URL = 'https://wbpds.wb.gov.in/(S(gcvx1f2yqohpgo2z21povrxx))/';
    const http = axios.create({
        baseURL : URL,
    });

    const readDirectory = async (dirPath) => {
      try{
        const files = await RNFS.readdir(dirPath);
        return files;
      } catch (error) {
        return [];
      }
      
 
    }


    const checkFileExists = async (filePath) => {
      try {
        const fileExists = await RNFS.exists(filePath);
        return fileExists;
      } catch (error) {
        console.log(error);
        return false;
      }
    };

    const shareFile = async (path, title, message) => {
      try {
        const result = await Share.open({
          title: title,
          message: message,
          url: path,
        });
        return {status : 'success', data : result}
      } catch (error) {
        return {status : 'error', message : error}
      }
    }

    return {
        http,
        URL,
        isFileExists:checkFileExists,
        readDirectory,
        shareFile
    }
}

export default CustomHelpers
