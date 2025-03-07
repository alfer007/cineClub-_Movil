import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

// Colores pastel asignados a las letras (A-Z)
const pastelColors = [
  "#FFB6C1", "#FFD700", "#87CEFA", "#FFA07A", "#98FB98",
  "#E6E6FA", "#FFDEAD", "#C3E6CB", "#F4A460", "#D8BFD8",
  "#FF69B4", "#AFEEEE", "#F0E68C", "#FFDAB9", "#E0FFFF",
  "#BC8F8F", "#4682B4", "#9ACD32", "#DA70D6", "#20B2AA",
  "#FA8072", "#40E0D0", "#FF6347", "#DDA0DD", "#66CDAA",
  "#B0E0E6"
];

const getColorByLetter = (letter) => {
  const index = letter.toUpperCase().charCodeAt(0) - 65; 
  return pastelColors[index % pastelColors.length]; 
};

const UserAvatar = ({ name, size = 50 }) => {
  const [initial, setInitial] = useState("?");
  const [backgroundColor, setBackgroundColor] = useState("#ccc");

  useEffect(() => {
    if (name) {
      const firstLetter = name.charAt(0).toUpperCase();
      setInitial(firstLetter);
      setBackgroundColor(getColorByLetter(firstLetter));
    }
  }, [name]);

  return (
    <View
      key={initial} 
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size / 2.5 }]}>
        {initial}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", 
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default UserAvatar;
