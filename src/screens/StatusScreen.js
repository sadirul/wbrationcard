import {useState, useEffect, useRef} from 'react'
import { View, BackHandler } from 'react-native'
import WebView from 'react-native-webview'
import {
  TestIds,
  useInterstitialAd
} from 'react-native-google-mobile-ads'

const StatusScreen = ({route, navigation}) => {
  const webViewRef = useRef(null)
  const [pageLoading, setPageLoading] = useState(0)
  const [showLoading, setShowLoading] = useState(true)
  const [webLoaded, setWebLoaded] = useState(false)
  const [canGoBackWeb, setCanGoBackWeb] = useState(false)
  const AdsConfig = require('../../AdsConfig.json')
  const interstitial_id = __DEV__ ? TestIds.INTERSTITIAL : AdsConfig.intersticial_id;

  const webUrl = route.params.url

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    )

    return () => backHandler.remove()
  }, [canGoBackWeb])

  // INTERSTITIAL ADS
  const { isLoaded, isClosed, load, show } = useInterstitialAd(interstitial_id, {
    requestNonPersonalizedAdsOnly: true,
  });

  useEffect(() => {
    load();
  }, [load, isClosed]);

  const handleBackPress =  () => {
    if (canGoBackWeb) {
      webViewRef.current.goBack()
      return true
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack()
        return true
      }
    }
    return true
  }
  
  return (
    <>  
        {
          showLoading ? (
              <View style={{ width: `${pageLoading}%`, backgroundColor: 'blue', height: 2.5 }}></View>
            ) : null
        }
        <WebView
            ref={webViewRef}
            source={{ uri: webUrl }}
            onLoadProgress={(event) => setPageLoading(event.nativeEvent.progress*100)}
            onLoadStart={() => setShowLoading(true)}
            onLoad={() => {
              setShowLoading(false)
              if (isLoaded && AdsConfig.show.interstitial && !webLoaded) {
                show();
                setWebLoaded((prev) => !prev)
              }
            }}
            onNavigationStateChange={state=>{
                setCanGoBackWeb(state.canGoBack)
            }}
            setSupportMultipleWindows={false}
        />
    </>

  )
}

export default StatusScreen
