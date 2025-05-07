import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { ViewStyle, StyleProp } from 'react-native';

interface MaterialIconProps {
    /**
     * Name of the material icon
     */
    name: React.ComponentProps<typeof MaterialIcons>['name'];

    /**
     * Size of the icon
     */
    size?: number;

    /**
     * Color of the icon
     */
    color?: string;

    /**
     * Optional style for the icon
     */
    style?: StyleProp<ViewStyle>;
}

/**
 * A component that renders Material Design icons
 */
const MaterialIcon = ({ name, size = 24, color = 'black', style }: MaterialIconProps) => {
    return <MaterialIcons name={name} size={size} color={color} style={style} />;
};

export default MaterialIcon; 