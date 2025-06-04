import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import * as ImagePicker from "expo-image-picker";
import { useDispatch } from "react-redux";
import { updateToken, updateAvatar, updateNickname } from "../reducers/user";

const avatars = [
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751155/astronaut_mzo08o.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751158/bun_e0epoh.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751155/captain_lurdm1.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751159/clown_mtkoye.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751155/girl_xr1ilk.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751156/knight_zgjmpy.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751160/mage_oslowx.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751158/monster_aqcdkl.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751157/mummy_p7efwx.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751156/mustach_n2ycmf.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751155/robot_ztcpjs.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751155/sloth_qqpwoz.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751155/surgeon_dquvar.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751157/viking_gxsl1c.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751160/witch_mt3j0o.png",
  "https://res.cloudinary.com/dxgix5q4e/image/upload/v1747751159/ninja_hyowdl.png",
];

export default function CreateProfileScreen({ route }) {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [pseudo, setPseudo] = useState("");
  const [avatarSelected, setAvatarSelected] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [invalidProfile, setInvalidProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = route.params.token;
  const dispatch = useDispatch();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission requise pour accéder à la galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selected = result.assets[0];
      setAvatarSelected(null); // remove avatar selection
      setBase64Image(`data:image/jpeg;base64,${selected.base64}`);
      setImagePreview(selected.uri);
    }
  };

  const pickAvatar = (url) => {
    setAvatarSelected(url);
    setBase64Image(null);
    setImagePreview(url);
  };

  const handleCreateProfile = () => {
    if (!pseudo || (!base64Image && !avatarSelected)) {
      setInvalidProfile(true);
      return;
    }

    setLoading(true);
    setInvalidProfile(false);

    const body = {
      token,
      nickname: pseudo,
      ...(avatarSelected && { avatarUrl: avatarSelected }),
      ...(base64Image && { base64Image }),
    };

    fetch(`${BACKEND_URL}/users/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.result) {
          dispatch(updateToken(token));
          dispatch(updateAvatar(data.url));
          dispatch(updateNickname(pseudo));
        } else {
          setInvalidProfile(true);
        }
      })
      .catch((err) => {
        setLoading(false);
        setInvalidProfile(true);
        console.log("Erreur :", err);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Créez votre profil</Text>

      <TextInput
        style={styles.input}
        placeholder="Pseudo"
        placeholderTextColor="#A0A0A0"
        value={pseudo}
        onChangeText={(text) => setPseudo(text)}
      />

      <Text style={styles.text}>Importez une image</Text>

      <TouchableOpacity onPress={pickImage} style={{ position: "relative" }}>
        <Image
          source={
            imagePreview
              ? { uri: imagePreview }
              : require("../assets/emptyAvatar.png")
          }
          style={styles.image}
        />
        <View style={styles.editIcon}>
          <FontAwesome5 name="edit" size={16} color="#EADDFF" />
        </View>
      </TouchableOpacity>

      <Text style={styles.text}>Ou choisissez un avatar</Text>
      <View style={styles.avatarContainer}>
        {avatars.map((url, index) => (
          <Pressable key={index} onPress={() => pickAvatar(url)}>
            <Image
              source={{ uri: url }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 50,
                margin: 8,
                borderWidth: url === avatarSelected ? 3 : 0,
                borderColor: "#65558F",
              }}
            />
          </Pressable>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleCreateProfile}
        style={styles.button}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Créer</Text>
      </TouchableOpacity>

      {invalidProfile && (
        <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
          Veuillez choisir un pseudo et une image/avatar
        </Text>
      )}

      {loading && (
        <Text style={{ marginTop: 10, color: "#65558F" }}>Chargement...</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBF1F1",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontFamily: "NotoSans_700Bold",
    color: "#335561",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    color: "#335561",
    height: 50,
    width: "70%",
    fontFamily: "NotoSans_400Regular",
  },
  avatarContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#65558F",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    height: 50,
  },
  buttonText: {
    color: "#EADDFF",
    fontSize: 20,
    fontFamily: "NotoSans_700Bold",
    textAlign: "center",
  },
  text: {
    color: "#335561",
    fontSize: 16,
    fontFamily: "NotoSans_700Bold",
  },
  image: {
    marginVertical: 20,
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  editIcon: {
    position: "absolute",
    bottom: 20,
    right: 0,
    backgroundColor: "#65558F",
    borderRadius: 5,
    paddingRight: 2,
    paddingTop: 2,
    paddingLeft: 4,
    paddingBottom: 4,
  },
});
