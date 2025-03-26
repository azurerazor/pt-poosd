import React from "react";
import { Grid, GridItem, HStack, VStack } from "@chakra-ui/react";
import FaceCard from "@/components/ui/FaceCard";
import PlayerProfile from "@/components/ui/PlayerProfile";


const Lobby: React.FC = () => {
    return (
        <>
            <div>
                <HStack>
                    <VStack
                        w="30%"
                        h="100vh"
                        gap={4}
                        p={4}
                    >
                        <PlayerProfile />
                        <PlayerProfile />
                        <PlayerProfile />
                        <PlayerProfile />
                        <PlayerProfile />
                        <PlayerProfile />
                    </VStack>
                    <Grid
                        w="70%"
                        h="100vh"
                        templateRows="repeat(3, 1fr)"
                        templateColumns="repeat(4, 1fr)"
                        gap={4}
                        p={4}
                    >
                        <GridItem rowSpan={1} colSpan={1}>
                            <FaceCard />
                        </GridItem>
                        <GridItem rowSpan={1} colSpan={1}>
                            <FaceCard />
                        </GridItem>
                        <GridItem rowSpan={1} colSpan={1}>
                            <FaceCard />
                        </GridItem>
                        <GridItem rowSpan={1} colSpan={1}>
                            <FaceCard />
                        </GridItem>
                        <GridItem rowSpan={1} colSpan={1}>
                            <FaceCard />
                        </GridItem>
                    </Grid>
                </HStack>
            </div>
        </>
    );
}

export default Lobby;