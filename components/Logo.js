import React from 'react';
import { Image, StyleSheet } from 'react-native';

const SOURCE = require('../images/logo.png');

export default function Logo({ width = 200, style }) {
  return (
    <Image
      source={SOURCE}
      resizeMode="contain"
      style={[styles.img, { width }, style]}
    />
  );
}

const styles = StyleSheet.create({
  img: { height: undefined, aspectRatio: 550 / 476 },
});
