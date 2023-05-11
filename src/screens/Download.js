import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFocusEffect } from '@react-navigation/native'
import { useState, useEffect, useCallback } from 'react'
import NetInfo from "@react-native-community/netinfo"
import CustomHelpers from './Helpers/CustomHelpers'
import RNFetchBlob from 'rn-fetch-blob'
import RNFS from 'react-native-fs'

import {
  FlatList,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ToastAndroid,
  Vibration
} from 'react-native'
import ImportedContext from '../Context/ContextAPI'
import { useContext } from 'react'


export default function Download({navigation}) {
  const MyContext = useContext(ImportedContext)
  const logoImg = require('../images/pdf.png')
  const ShareIcon = require('../images/share.png')
  const WebIcon = require('../images/web.png')
  const DeleteIcon = require('../images/delete.png')
  const DeleteWarningIcon = require('../images/delete_warning.png')

  const [allFiles, setAllFiles] = useState([])
  const [filter, setFilter] = useState([])
  const [searchCount, setSearchCount] = useState(0)
  

  const { fs } = RNFetchBlob
  const dirPath = `${fs.dirs.DownloadDir}/WB Ration Card`
  const { readDirectory, shareFile } = CustomHelpers()

  const openFile = (id) => {
    const path = `${dirPath}/${allFiles[id]}`
    RNFetchBlob.android.actionViewIntent(path, 'application/pdf')
  }

  const getFiles = async () => {
    const files = await readDirectory(dirPath)
    setAllFiles(files)
    setFilter(files)
    setSearchCount(files.length)
  }

  useFocusEffect(
    useCallback(() => {
      getFiles()
      setSearchText('')
    }, [])
  )

  const [isInternet, setIsInternet] = useState(false)
  useEffect(()=>{
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsInternet(state.isConnected)
    })
    return () =>{
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if(MyContext.donwloadedContext){
      setAllFiles( (prev) => [...prev, MyContext.donwloadedContext] )
      setSearchCount((prev) => prev + 1)
    }
  }, [MyContext.donwloadedContext])

  const [deleteId, setDeleteId] = useState()
  const deleteRationCard = async (id) => {
    Vibration.vibrate(100)
    setDeleteId(id)
    setModalVisible(true)
  }

  const shareRationCard = async (id) => {
    const fileName = allFiles[id]
    const path = `file://${dirPath}/${fileName}`
    await shareFile(path, 'Share Ration Card', `Share Ration Card - ${fileName}`)
  }

  const [closeThis, setCloseThis] = useState(null)
  const [closeRef, setCloseRef] = useState(null)
  const swipeableOpen = id => {
    if (closeThis !== null && (id !== closeThis)) {
      closeRef.close()
    }
    setCloseRef(refList[id])
    setCloseThis(id)
  }

  const [searchText, setSearchText] = useState('')
  const handelSearch = text => {
    setSearchText(text)
    const results = filter.filter((item) =>
      item.trim().toLowerCase().includes(text.toLowerCase())
    )
    setAllFiles(results)
    setSearchCount(results.length)
  }
  const [modalVisible, setModalVisible] = useState(false)

  const handleDelete = async () => {
    const fileName = allFiles[deleteId].trim()
    const path = `file://${dirPath}/${fileName}`
    await RNFS.unlink(path)
    setAllFiles((prev) => prev.filter(val => val.trim() !== fileName))
    setFilter((prev) => prev.filter(val => val.trim() !== fileName))

    if (closeThis !== null && (deleteId === closeThis)) {
      closeRef.close()
    }
    setModalVisible(false)
    setSearchCount((prev) => prev - 1)
    ToastAndroid.show("Ration Card deteted successfully!", ToastAndroid.SHORT)
  }

  const checkStatus = async (id) => {
    if(!isInternet){
      ToastAndroid.show("Please connect Internet!", ToastAndroid.SHORT)
      return false
    }else{
      
      const fileName = allFiles[id].trim()
      let splData = fileName.split('-')
      let category, rationCardNumber
      if(splData.length == 3){
        category = splData[0]+'-'+splData[1]
      }else{
        category = splData[0]
      }
      rationCardNumber = splData.at(-1).replace(".pdf", '')
      let url = `https://wbpds.wb.gov.in/(S(qyrbqugzxbsphijsnd1lurks))/CheckRationCardStatus.aspx?RCNO=${rationCardNumber}&&RCCATEGORY=${category}`
      navigation.navigate('StatusScreen', {url : url})
    }
  }

  const rightView = (id) => (
    <>
      <View style={styles.deleteShare}>
      <TouchableOpacity
          onPress={() => {
            checkStatus(id)
          }}
          style={styles.rightStatusViewStyle}>
          <Image source={WebIcon} style={{ width: 30, height: 30 }} tintColor='white' />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            shareRationCard(id)
          }}
          style={styles.rightShareViewStyle}>
          <Image source={ShareIcon} style={{ width: 30, height: 30 }} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            deleteRationCard(id)
          }}
          style={styles.rightDeleteViewStyle}>
          <Image source={DeleteIcon} style={{ width: 30, height: 30, tintColor: 'white' }} />
        </TouchableOpacity>

        <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
          <Image source={DeleteWarningIcon} style={{ width: 70, height: 65 }} />
            <Text style={styles.modalText}>Are you sure?</Text>
            <Text style={styles.modalTextBottom}>You won't be able to revert this!</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.button, styles.cancelButton]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDelete}>
                <Text style={[styles.button, styles.deleteButton]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      </View>
    </>


  )
  const [refList, setRefList] = useState([])
  function renderElements() {
    return allFiles.length > 0 ? (
      <>
        <FlatList
          style={{ width: '98%' }}
          data={allFiles}
          renderItem={({ item, index }) => (
            <GestureHandlerRootView>
              <Swipeable

                ref={
                  (swipeableRef) => { refList[index] = swipeableRef }
                }
                onSwipeableOpen={() => swipeableOpen(index)}
                renderRightActions={() => rightView(index)}>
                <TouchableOpacity style={styles.item} onPress={() => openFile(index)}>
                  <Image style={styles.logoImg} source={logoImg} />
                  <Text style={styles.itemText} key={index}>{item}</Text>
                </TouchableOpacity>
              </Swipeable>
            </GestureHandlerRootView>
          )}
        />
      </>
    ) : (
      <>
        <ActivityIndicator size="large" color="#ff0000" />
        <Text style={{ fontWeight: 'bold', color: 'black' }}>Loading Ration Card...</Text>
      </>
    )
  }


  return (
    <View style={styles.container}>
      <TextInput
        style={{
          backgroundColor: 'white',
          width: '98%',
          marginBottom: 10,
          fontWeight: 'bold',
          fontSize: 15,
          borderColor: '#ccc',
          borderWidth: 1,
          borderRadius: 5,
          paddingHorizontal: 10,
          color: 'black'
        }}
        placeholder='Search...'
        onChangeText={(text) => {
          handelSearch(text)
          
        }}
        value={searchText}
        placeholderTextColor={'gray'}
      />
      <View style={{ alignSelf: 'flex-start', marginLeft: 5, }}>
        <Text style={{ fontWeight: 'bold', color: 'black' }}>Result{(searchCount > 1) ? 's' : ''} : {searchCount}</Text>
      </View>
      {
        renderElements()
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 5,
  },
  item: {
    backgroundColor: 'white',
    marginBottom: 5,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    shadowOffset: 5,
  },
  logoImg: {
    width: 50,
    height: 50,
  },
  itemText: {
    fontWeight: 'bold',
    marginLeft: 15,
    fontSize: 15,
    color: 'black'
  },
  rightDeleteViewStyle: {
    backgroundColor: '#ff0000',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 10,
    borderRadius: 5,
    marginLeft: 4.3,
    marginBottom: 5

  },
  rightShareViewStyle: {
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 10,
    borderRadius: 5,
    marginLeft: 3.5,
    marginBottom: 5
  },
  rightStatusViewStyle: {
    backgroundColor: '#5900b3',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 10,
    borderRadius: 5,
    marginLeft: 4,
    marginBottom: 5
  },
  deleteShare: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 18,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: '100%',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
  },
  modalText: {
    fontSize: 20,
    marginBottom: 5,
    fontWeight: 'bold',
    color: 'black',
  },
  modalTextBottom:{
    marginBottom: 10,
    fontWeight: 'bold',
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
    textAlign: 'center',
    minWidth: 80,
  },
  cancelButton: {
    color: '#333',
    backgroundColor: '#ccc',
  },
  deleteButton: {
    color: '#fff',
    backgroundColor: 'red',
  },
})


