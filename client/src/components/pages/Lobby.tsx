import React from "react";
import FaceCard from "../ui/FaceCard";
import PlayerProfile from "../ui/PlayerProfile";
import RouteButton from "../misc/RouteButton";


const Lobby: React.FC = () => {
    return (
        <>
            <div className="flex justify-center gap-4 p-4 h-screen">
                <div className="flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-bold">Lobby Code: abcdefg</h2>
                        <hr className="mb-2" />
                        <PlayerProfile />
                        <PlayerProfile />
                        <PlayerProfile />
                        <PlayerProfile />
                        <PlayerProfile />
                        <PlayerProfile />
                        <PlayerProfile />
                    </div>
                    <div className="flex justify-between items-center">
                        <RouteButton to="NotFound">Start</RouteButton>
                        <RouteButton to="NotFound">Exit</RouteButton>
                    </div>
                </div>
                <div className="grid grid-rows-2 grid-cols-3 gap-4 gap-x-4 justify-between">
                    <FaceCard />
                    <FaceCard />
                    <FaceCard />
                    <FaceCard />
                    <FaceCard />
                    <FaceCard />
                </div>
                {/* <HStack>
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
                </HStack> */}
            </div>
        </>
    );
}

export default Lobby;