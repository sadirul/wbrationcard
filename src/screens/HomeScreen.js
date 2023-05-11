import changeNavigationBarColor from 'react-native-navigation-bar-color'
import DropDownPicker from 'react-native-dropdown-picker'
import NetInfo from "@react-native-community/netinfo"
import CustomHelpers from './Helpers/CustomHelpers'
import {useEffect, useState} from 'react'
import RNFetchBlob from 'rn-fetch-blob'
import { 
  TouchableOpacity,
  PermissionsAndroid,
  ToastAndroid,
  ActivityIndicator,
  StatusBar,
  BackHandler,
  Text, 
  View, 
  StyleSheet,
  // ImageBackground, 
  Image,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native'
import MyContext from '../Context/ContextAPI'
import { useContext } from 'react'
import {
  TestIds,
  useInterstitialAd
} from 'react-native-google-mobile-ads'



export default function HomeScreen({navigation}) {
  const context = useContext(MyContext);
  const [isInternet, setIsInternet] = useState(false)
  const AdsConfig = require('../../AdsConfig.json')
  const interstitial_id = __DEV__ ? TestIds.INTERSTITIAL : AdsConfig.intersticial_id;


  useEffect(()=>{
    changeNavigationBarColor('#02A8F4')
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsInternet(state.isConnected)
    })
    return () =>{
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      setOpen(false)
    })
    return unsubscribe
  }, [navigation])

    // INTERSTITIAL ADS
    const { isLoaded, isClosed, load, show } = useInterstitialAd(interstitial_id, {
      requestNonPersonalizedAdsOnly: true,
    });
  
    useEffect(() => {
      load();
    }, [load, isClosed]);


  const { config, fs } = RNFetchBlob
  const RootDir = `${fs.dirs.DownloadDir}/WB Ration Card/`
  const downloadFile = async (fileUrl) => {
    ToastAndroid.show("Downloading...", ToastAndroid.SHORT)
    let FILE_URL = fileUrl    
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        path: `${RootDir}${value}-${rationCardNumber}.pdf`,
        description: 'Downloading Ration Card...',
        notification: true,
        useDownloadManager: true,   
      },
    }
    await config(options)
      .fetch('GET', FILE_URL)
      .then(res => {
        setShowShareDiv(true)
        ToastAndroid.show('File Downloaded Successfully.', ToastAndroid.SHORT)
        context.setDownloadedContext( () => `${value}-${rationCardNumber}.pdf` )
        if (isLoaded && AdsConfig.show.interstitial) {
          show();
        }
      })
  }


  const checkPermission = async (url) => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message:
              'Application needs access to your storage to download File',
          }
        )
        if ('granted' === PermissionsAndroid.RESULTS.GRANTED) {
          downloadFile(url)
        } else {
          ToastAndroid.show('Storage Permission Not Granted!', ToastAndroid.SHORT)
        }
      } catch (err) {
        console.log("++++"+err)
      }
    
  }
    const backgroundImg = require('../images/bg.jpg')
    const logoImg = require('../images/icon.png')

    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(null)
    const [items, setItems] = useState([
      {label: 'AAY', value: 'AAY'},
      {label: 'PHH', value: 'PHH'},
      {label: 'SPHH', value: 'SPHH'},
      {label: 'RKSY-I', value: 'RKSY-I'},
      {label: 'RKSY-II', value: 'RKSY-II'},
      {label: 'GEN', value: 'GEN'},
    ])
    const [rationCardNumber, setRationCardNumber] = useState('')
    const {http, URL, isFileExists, shareFile} = CustomHelpers()

    const [shareableFile, setShareableFile] = useState('')
    const [fileName, setFileName] = useState('')

    const handelDownload = async () => {
      if(!isInternet){
        ToastAndroid.show('Please connect Internet!', ToastAndroid.SHORT)
        return false
      }
      
      if(!rationCardNumber){
        ToastAndroid.show('Please enter Ration Card No!', ToastAndroid.SHORT)
        return false
      }
      Keyboard.dismiss()

      if(!value){
        ToastAndroid.show('Please choose Category!', ToastAndroid.SHORT)
        return false
      }
      
      let checkThisFile = `${RootDir}${value}-${rationCardNumber}.pdf`
      setShareableFile(`file://${checkThisFile}`)
      setFileName(`${value}-${rationCardNumber}.pdf`)
      const exists = await isFileExists(checkThisFile)
      
      if(exists){
        ToastAndroid.show("Ration Card already exists!", ToastAndroid.SHORT)
        setLoading(false)
        setShowShareDiv(true)
        return false
      }else{
        setShowShareDiv(false)
      }
      setLoading(true)
      http.get(`ERC.aspx?RCNO=${rationCardNumber}&CATEGORY=${value}`)
      .then(response => {
          setLoading(false)
          if(response.data.includes('NO DATA FOUND')){
            ToastAndroid.show('Ration Card Not Found!', ToastAndroid.SHORT)
            return false
          }
          
          checkPermission(URL + `ERC.aspx?RCNO=${rationCardNumber}&CATEGORY=${value}`)
      })
      .catch(error => {
          console.log(error.response)
      })
    }

    const [lastBackPressTime, setLastBackPressTime] = useState(0)

    useEffect(() => {
      const onBackPress = () => {
        if(navigation.canGoBack()){
          navigation.goBack()
          return true
        }
        const currentTime = new Date().getTime()
        if (currentTime - lastBackPressTime < 2000) {
          BackHandler.exitApp()
        } else {
          setLastBackPressTime(currentTime)
          ToastAndroid.show('Press back again to exit', ToastAndroid.LONG)
          return true
        }
      }
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress)
      return () => backHandler.remove()
    }, [lastBackPressTime])

    const [showShareDiv, setShowShareDiv] = useState(false)

    const shareFileNow = async ()=>{
      await shareFile(shareableFile, 'Share Ration Card', `Share Ration Card - ${fileName}`)
    }

    const openFile = () => {
      const path = shareableFile.replace("file:///", '/')
      RNFetchBlob.android.actionViewIntent(path, 'application/pdf')
    }

    const checkStatus = async () => {
      if(!isInternet){
        ToastAndroid.show("Please connect Internet!", ToastAndroid.SHORT)
        return false
      }else{
        let url = `https://wbpds.wb.gov.in/(S(qyrbqugzxbsphijsnd1lurks))/CheckRationCardStatus.aspx?RCNO=${rationCardNumber}&RCCATEGORY=${value}`
        navigation.navigate('StatusScreen', {url : url})
      }
    }
  
    return (
      <>
      <StatusBar backgroundColor='#02A8F4'/>
      <TouchableWithoutFeedback onPress={() => setOpen(false)}>
      <View style={styles.container}>
        {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#02A8F4" style={styles.indicator}/>
          <Text style={styles.fetchingStyleText}>Fetching Ration Card...</Text>
        </View>
      )}
        {/* <ImageBackground source={backgroundImg} resizeMode="cover" style={styles.backgroundImg}> */}
          <View style={styles.logoImgView}>
            <Image style={styles.logoImg}  source={logoImg}/>
          </View>

          <Text style={styles.inputTitle}>Enter Ration Card Number* :</Text>
          <TextInput 
            style={styles.textInput} 
            placeholder='Ration Card Number'
            keyboardType='numeric'
            onChangeText={(number) => {
              setRationCardNumber(number)
              setShowShareDiv(false)
            }}
            onFocus={() => setOpen(false)}
            placeholderTextColor={'gray'}
          />

          <Text style={styles.inputTitle}>Select Category* :</Text>
          
            <View style={styles.dropDownStyle}>
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                closeOnBackPressed={true}
                onOpen={()=>{
                  Keyboard.dismiss()
                  setShowShareDiv(false)
                }}
                maxHeight={220}
                searchable={true}
                searchPlaceholder='Search Category...'
                style={{ borderColor: '#ccc' }}
                placeholder='Select Category'
                listMode="MODAL"
              />  
            </View>
          
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity style={styles.downloadBtnView} onPress={(event) => handelDownload()}>
              <Text style={styles.openShareStatus}>Download</Text>
            </TouchableOpacity>
          </View>
          {showShareDiv && 
            <View style={styles.exists}>
              <TouchableOpacity style={[styles.downloadBtnView, {backgroundColor:'#00b300'}]} onPress={(event) => openFile()}>
                  <Text style={styles.openShareStatus}>Open</Text>
              </TouchableOpacity>
            
              <TouchableOpacity style={[styles.downloadBtnView, {backgroundColor:'#ff0066'}]} onPress={(event) => shareFileNow()}>
                  <Text style={styles.openShareStatus}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.downloadBtnView, {backgroundColor:'#5900b3'}]} onPress={(event) => checkStatus()}>
                  <Text style={styles.openShareStatus}>Status</Text>
              </TouchableOpacity>
            </View>
          }

        {/* </ImageBackground>       */}
    </View>
    </TouchableWithoutFeedback>
    </>
    )
}

  const styles = StyleSheet.create({
    container : {
       flex: 1,
    },
    exists:{
      backgroundColor: 'white',
      paddingHorizontal: 10,
      margin: 10,
      height: 50,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      borderRadius: 6,
    },
    // backgroundImg: {
    //   width: '100%',
    //   flex: 1,
    // },
    logoImgView: {
      width: '100%',
      height: 100,
      marginTop: 10,
      textAlign: 'center',
      alignItems: 'center',
      borderColor: '#ccc',
    },
    logoImg: {
      width: 100,
      height : 100,
      borderWidth: 2,
      borderColor: '#ccc',
      borderRadius: 50,
    },
    inputTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'left',
      marginLeft: 10,
      color: 'black'
    },
    textInput: {
      backgroundColor: 'white',
      margin: 10,
      fontSize: 18,
      fontWeight: 'bold',
      paddingHorizontal: 8,
      color: 'black',
      borderWidth: 1,
      borderColor: '#ccc'
    },
    dropDownStyle: {
      margin: 10,
      zIndex: 1
    },
    downloadBtnView: {
      alignItems: 'center',
      width: '32.5%',
      backgroundColor: '#02A8F4',
      padding: 8,
      justifyContent: 'center',
      borderRadius: 25,
      borderColor:'#ccc',
      borderWidth: 1
    },
    openShareStatus: {
      color: 'white',
      textAlign: 'center',
      borderRadius: 25,
      fontWeight: 'bold',
      fontSize: 18,
    },
    loader: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
      // marginTop: 120
    },
    fetchingStyleText: {
      fontWeight: 'bold',
      fontSize: 20, 
      color: '#d3d8da'
    },
    indicator: {
      marginTop: 100
    }
  })
