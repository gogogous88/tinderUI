import React, { Component } from "react";
import {
  View,
  Text,
  Animated,
  ScrollView,
  PanResponder,
  Dimensions,
  StyleSheet,
  LayoutAnimation,
  UIManager
} from "react-native";
import { Card, Button } from "react-native-elements";

const { width, height } = Dimensions.get("window");
let SwipeRange = width * 1.5;
let MoveRange = SwipeRange / 4;
class Deck extends Component {
  constructor(props) {
    super(props);
    this.position = new Animated.ValueXY(0, 0);
    this.PanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, guesture) => {
        this.position.setValue({ x: guesture.dx, y: guesture.dy });
      },
      onPanResponderRelease: this.onCardReset
    });

    this.state = { index: 0 };
  }

  componentWillReceiveProps = newProps => {
    this.props.data != newProps.data && this.setState({ index: 0 });
  };

  componentWillUpdate = () => {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  };

  onCardReset = (event, guesture) => {
    const { dx } = guesture;
    if (dx < MoveRange && dx > -MoveRange) {
      Animated.spring(this.position, { toValue: { x: 0, y: 0 } }).start();
    } else if (dx > MoveRange) {
      this.swipeOut("right");
    } else {
      this.swipeOut("left");
    }
  };

  swipeOut = direction => {
    const x = direction == "right" ? width : -width;
    Animated.spring(this.position, { toValue: { x, y: 0 } }).start();
    this.position.setValue({ x: 0, y: 0 });
    this.setState({ index: this.state.index + 1 });
  };

  renderAnimation = () => {
    let rotate = this.position.x.interpolate({
      inputRange: [-SwipeRange, 0, SwipeRange],
      outputRange: ["-120deg", "0deg", "120deg"]
    });
    return { ...this.position.getLayout(), transform: [{ rotate }] };
  };

  renderItems = () => {
    const { data, renderItems } = this.props;
    if (this.state.index > data.length - 1) {
      return (
        <Card
          title="No More Cards"
          style={[styles.stack, { top: this.state.index * 5 }]}
        >
          <Button
            title="increase distance"
            buttonStyle={{ backgroundColor: "darkblue" }}
          />
        </Card>
      );
    }
    return data
      .map((item, index) => {
        if (index == this.state.index) {
          return (
            <Animated.View
              key={item.id}
              style={[this.renderAnimation(), styles.stack]}
              {...this.PanResponder.panHandlers}
            >
              <Card title={item.text} image={{ uri: item.uri }}>
                <Button
                  title="click here"
                  buttonStyle={{ backgroundColor: "darkblue" }}
                />
              </Card>
            </Animated.View>
          );
        }
        if (index < this.state.index) {
          return null;
        }
        return (
          <Animated.View
            key={item.id}
            style={[styles.stack, { top: (index - this.state.index) * 10 }]}
          >
            {renderItems(item)}
          </Animated.View>
        );
      })
      .reverse();
  };
  render() {
    return (
      <View style={[{ flex: 1, backgroundColor: "#fff" }]}>
        {this.renderItems()}
      </View>
    );
  }
}

export default Deck;

const styles = StyleSheet.create({
  stack: {
    position: "absolute",
    width
  }
});
