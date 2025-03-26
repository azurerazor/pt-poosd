import React from "react";
import {
    Avatar,
    Button,
    Card,
    HStack,
    Stack,
    Strong,
    Text,
} from "@chakra-ui/react";

const PlayerProfile: React.FC = () => {
    return (
        <Card.Root className="w-full">
            <Card.Body>
                <HStack gap="3">
                    <Avatar.Root>
                        <Avatar.Image src="https://images.unsplash.com/photo-1511806754518-53bada35f930" />
                        <Avatar.Fallback name="Username" />
                    </Avatar.Root>
                    <Stack gap="0">
                        <Text fontWeight="semibold" textStyle="sm">
                            Username
                        </Text>
                    </Stack>
                </HStack>
            </Card.Body>
        </Card.Root>
    )
}

export default PlayerProfile;