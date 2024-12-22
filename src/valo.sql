--
--  First drop any existing tables. Any errors are ignored.
--

drop table Gun1 cascade constraints;
drop table Gun2 cascade constraints;
drop table WeaponStats cascade constraints;
drop table Map1 cascade constraints;
drop table Map2 cascade constraints;
drop table Agent cascade constraints;
drop table Player cascade constraints;
drop table PlayedInMatch cascade constraints;
drop table Match cascade constraints;
drop table Round cascade constraints;
drop table Region1 cascade constraints;
drop table Region2 cascade constraints;
drop table Team cascade constraints;
drop table ProPlayer cascade constraints;
drop table Mains cascade constraints;

--
--  Creating the required tables.
--

CREATE TABLE Gun2 ( 
    gunCost INTEGER, 
    totalMags INTEGER, 
    gunType VARCHAR(32) NOT NULL, 
    PRIMARY KEY (gunCost, totalMags) 
);

CREATE TABLE Gun1 ( 
    gunName VARCHAR(32) PRIMARY KEY, 
    magCapacity INTEGER NOT NULL, 
    gunCost INTEGER NOT NULL,
    totalMags INTEGER,
    FOREIGN KEY (gunCost, totalMags) REFERENCES Gun2(gunCost, totalMags) ON DELETE CASCADE
);

CREATE TABLE Player ( 
    riotId  VARCHAR(32) PRIMARY KEY, 
    playerName VARCHAR(32), 
    rank   VARCHAR(32) 
);

CREATE TABLE WeaponStats ( 
    gunName   VARCHAR(32), 
    riotId    VARCHAR(32), 
    headshotPercentage INTEGER, 
    kills     INTEGER, 
    PRIMARY KEY (gunName, riotId),
    FOREIGN KEY (gunName) REFERENCES Gun1(gunName) ON DELETE CASCADE, 
    FOREIGN KEY (riotId) REFERENCES Player(riotId) ON DELETE CASCADE
); 

CREATE TABLE Map1 ( 
    numSites INTEGER PRIMARY KEY, 
    numOrbs INTEGER 
);

CREATE TABLE Map2 ( 
    mapName VARCHAR(32) PRIMARY KEY, 
    numSites  INTEGER NOT NULL, 
    FOREIGN KEY (numSites) REFERENCES Map1(numSites) ON DELETE CASCADE
);

CREATE TABLE Agent ( 
    agentName  VARCHAR(32) PRIMARY KEY, 
    agentType  VARCHAR(32) NOT NULL, 
    qAbility    VARCHAR(32) NOT NULL, 
    eAbility    VARCHAR(32) NOT NULL, 
    cAbility    VARCHAR(32) NOT NULL, 
    ultimateAbility VARCHAR(32) NOT NULL 
);

CREATE TABLE Region2 ( 
    numServers INTEGER PRIMARY KEY, 
    population INTEGER 
);

CREATE TABLE Region1 ( 
    regionName VARCHAR(32) PRIMARY KEY, 
    numServers INTEGER, 
    FOREIGN KEY (numServers) REFERENCES Region2(numServers) ON DELETE CASCADE
);

CREATE TABLE Match ( 
    matchId   INTEGER PRIMARY KEY, 
    startTime  TIMESTAMP NOT NULL, 
    regionName VARCHAR(32), 
    mapName VARCHAR(32) NOT NULL, 
    FOREIGN KEY (regionName) REFERENCES Region1(regionName) ON DELETE CASCADE,
    FOREIGN KEY (mapName) REFERENCES Map2(mapName) ON DELETE CASCADE
);

CREATE TABLE PlayedInMatch ( 
    riotId  VARCHAR(32),
    matchId   INTEGER, 
    agentName VARCHAR(32) NOT NULL, 
    kills   INTEGER, 
    deaths  INTEGER, 
    won   NUMBER(1), -- 1 for true, 0 for false
    assists  INTEGER, 
    PRIMARY KEY (riotId, matchId),
    FOREIGN KEY (riotId) REFERENCES Player(riotId) ON DELETE CASCADE,
    FOREIGN KEY (matchId) REFERENCES Match(matchId) ON DELETE CASCADE,
    FOREIGN KEY (agentName) REFERENCES Agent(agentName) ON DELETE CASCADE
);

CREATE TABLE Round ( 
    roundNumber  INTEGER, 
    matchId    INTEGER, 
    spikePlanted  NUMBER(1), -- 1 for true, 0 for false
    PRIMARY KEY (roundNumber, matchId),
    FOREIGN KEY (matchId) REFERENCES Match(matchId) ON DELETE CASCADE
);


CREATE TABLE Team ( 
    teamName VARCHAR(32) PRIMARY KEY, 
    color  VARCHAR(32), 
    regionName VARCHAR(32), 
    FOREIGN KEY (regionName) REFERENCES Region1(regionName) ON DELETE CASCADE
);

CREATE TABLE ProPlayer ( 
    riotID   VARCHAR(32) PRIMARY KEY, 
    jerseyNumber  INTEGER, 
    earnings    INTEGER, 
    signDate   TIMESTAMP, 
    contractLength INTEGER, 
    teamName  VARCHAR(32), 
    FOREIGN KEY (teamName) REFERENCES Team(teamName) ON DELETE CASCADE
);

CREATE TABLE Mains ( 
    riotID  VARCHAR(32), 
    agentName VARCHAR(32), 
    PRIMARY KEY (riotId, agentName), 
    FOREIGN KEY (riotId) REFERENCES ProPlayer(riotId) ON DELETE CASCADE,
    FOREIGN KEY (agentName) REFERENCES Agent(agentName) ON DELETE CASCADE
);


--
--  Inserting the data into the tables.
--

INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (2900, 3, 'Rifle');
INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (800, 5, 'Pistol');
INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (2400, 6, 'Sniper');
INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (3400, 3, 'Machine gun');
INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (1600, 4, 'SMG');
INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (1200, 4, 'Rifle');
INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (1300, 4, 'Rifle');
INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (800, 4, 'pistol');
INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (40000, 1, 'Mini Nuke Launcher');
INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (50000, 1, 'Mini Nuke Launcher');
INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (4000, 10, 'Pistol');
INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (600, 3, 'Pistol');
INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (2100, 2, 'Shotgun');
INSERT INTO Gun2 (gunCost, totalMags, gunType) VALUES (4500, 4, 'Sniper');

INSERT INTO Gun1 (gunName, magCapacity, gunCost, totalMags) VALUES ('Vandal', 25, 2900, 3);
INSERT INTO Gun1 (gunName, magCapacity, gunCost, totalMags) VALUES ('Sheriff', 6, 800, 5);
INSERT INTO Gun1 (gunName, magCapacity, gunCost, totalMags) VALUES ('Outlaw', 2, 2400, 6);
INSERT INTO Gun1 (gunName, magCapacity, gunCost, totalMags) VALUES ('Odin', 100, 3400, 3);
INSERT INTO Gun1 (gunName, magCapacity, gunCost, totalMags) VALUES ('Spectre', 30, 1600, 4);
INSERT INTO Gun1 (gunName, magCapacity, gunCost, totalMags) VALUES ('Justice', 15, 2900, 3);
INSERT INTO Gun1 (gunName, magCapacity, gunCost, totalMags) VALUES ('Ultimatum', 16, 4000, 10);
INSERT INTO Gun1 (gunName, magCapacity, gunCost, totalMags) VALUES ('Fat Man', 1, 40000, 1);
INSERT INTO Gun1 (gunName, magCapacity, gunCost, totalMags) VALUES ('Big Boy', 1, 50000, 1);
INSERT INTO Gun1 (gunName, magCapacity, gunCost, totalMags) VALUES ('Classic', 12, 600, 3);
INSERT INTO Gun1 (gunName, magCapacity, gunCost, totalMags) VALUES ('Judge', 7, 2100, 2);
INSERT INTO Gun1 (gunName, magCapacity, gunCost, totalMags) VALUES ('Operator', 5, 4500, 4);

INSERT INTO Player (riotID, playerName, rank) VALUES ('ABC', 'Mike', 'Platinum');
INSERT INTO Player (riotID, playerName, rank) VALUES ('XYZ', 'Zach', 'Bronze');
INSERT INTO Player (riotID, playerName, rank) VALUES ('PQR', 'Tyson', 'Radiant');
INSERT INTO Player (riotID, playerName, rank) VALUES ('MNO', 'Jordan', 'Ascendant');
INSERT INTO Player (riotID, playerName, rank) VALUES ('IJK', 'Trent', 'Platinum');
INSERT INTO Player (riotID, playerName, rank) VALUES ('JKR', 'JK Rowling', 'Wood');
INSERT INTO Player (riotID, playerName, rank) VALUES ('MRB', 'Mr.Beast', 'Wood');
INSERT INTO Player (riotID, playerName, rank) VALUES ('DJP', 'Jordan Peterson', 'Wood');
INSERT INTO Player (riotID, playerName, rank) VALUES ('DJT', 'Donald J Trump', 'Wood');
INSERT INTO Player (riotID, playerName, rank) VALUES ('RTR', 'Ramy the Rat', 'Ascendant');
INSERT INTO Player (riotID, playerName, rank) VALUES ('PBP', 'Peter Benjam Parker', 'Ascendant');
INSERT INTO Player (riotID, playerName, rank) VALUES ('LMN', 'Lionel', 'Gold');
INSERT INTO Player (riotID, playerName, rank) VALUES ('FGH', 'Frodo', 'Silver');
INSERT INTO Player (riotID, playerName, rank) VALUES ('THR', 'Thor', 'Diamond');
INSERT INTO Player (riotID, playerName, rank) VALUES ('BLK', 'Black Widow', 'Iron');

INSERT INTO WeaponStats (gunName, riotID, headshotPercentage, kills) VALUES ('Vandal', 'ABC', 18, 22);
INSERT INTO WeaponStats (gunName, riotID, headshotPercentage, kills) VALUES ('Sheriff', 'ABC', 13, 4);
INSERT INTO WeaponStats (gunName, riotID, headshotPercentage, kills) VALUES ('Outlaw', 'XYZ', 8, 0);
INSERT INTO WeaponStats (gunName, riotID, headshotPercentage, kills) VALUES ('Odin', 'PQR', 4, 14);
INSERT INTO WeaponStats (gunName, riotID, headshotPercentage, kills) VALUES ('Vandal', 'PQR', 23, 34);
INSERT INTO WeaponStats (gunName, riotID, headshotPercentage, kills) VALUES ('Justice', 'PQR', 40, 400);
INSERT INTO WeaponStats (gunName, riotID, headshotPercentage, kills) VALUES ('Fat Man', 'DJT', 0, 3000);
INSERT INTO WeaponStats (gunName, riotID, headshotPercentage, kills) VALUES ('Ultimatum', 'PBP', 90, 300);
INSERT INTO WeaponStats (gunName, riotID, headshotPercentage, kills) VALUES ('Classic', 'LMN', 15, 10);
INSERT INTO WeaponStats (gunName, riotID, headshotPercentage, kills) VALUES ('Judge', 'FGH', 20, 25);
INSERT INTO WeaponStats (gunName, riotID, headshotPercentage, kills) VALUES ('Operator', 'THR', 30, 40);
INSERT INTO WeaponStats (gunName, riotID, headshotPercentage, kills) VALUES ('Vandal', 'BLK', 10, 15);

INSERT INTO Map1 (numSites, numOrbs) VALUES (2, 3);
INSERT INTO Map1 (numSites, numOrbs) VALUES (3, 3);
INSERT INTO Map1 (numSites, numOrbs) VALUES (1, 2);
INSERT INTO Map1 (numSites, numOrbs) VALUES (4, 4);
INSERT INTO Map1 (numSites, numOrbs) VALUES (5, 4);
INSERT INTO Map1 (numSites, numOrbs) VALUES (6, 3);
INSERT INTO Map1 (numSites, numOrbs) VALUES (7, 4);
INSERT INTO Map1 (numSites, numOrbs) VALUES (8, 4);
INSERT INTO Map1 (numSites, numOrbs) VALUES (9, 5);
INSERT INTO Map1 (numSites, numOrbs) VALUES (10, 3);

INSERT INTO Map2 (mapName, numSites) VALUES ('Haven', 3);
INSERT INTO Map2 (mapName, numSites) VALUES ('Sunset', 2);
INSERT INTO Map2 (mapName, numSites) VALUES ('Abyss', 1);
INSERT INTO Map2 (mapName, numSites) VALUES ('Lotus', 4);
INSERT INTO Map2 (mapName, numSites) VALUES ('Fracture', 5);
INSERT INTO Map2 (mapName, numSites) VALUES ('My Swamp', 6);
INSERT INTO Map2 (mapName, numSites) VALUES ('Gotham City', 7);
INSERT INTO Map2 (mapName, numSites) VALUES ('Commonwealth', 8);
INSERT INTO Map2 (mapName, numSites) VALUES ('Breeze', 9);
INSERT INTO Map2 (mapName, numSites) VALUES ('Icebox', 10);

INSERT INTO Agent (agentName, agentType, qAbility, eAbility, cAbility, ultimateAbility) VALUES 
('Cypher', 'Sentinel', 'Cyber Cage', 'Spycam', 'Trapwire', 'Neural Theft');
INSERT INTO Agent (agentName, agentType, qAbility, eAbility, cAbility, ultimateAbility) VALUES 
('Gekko', 'Initiator', 'Wingman', 'Dizzy', 'Mosh Pit', 'Thrash');
INSERT INTO Agent (agentName, agentType, qAbility, eAbility, cAbility, ultimateAbility) VALUES 
('Viper', 'Controller', 'Poison Cloud', 'Toxic Screen', 'Snake Bite', 'Viper’s Pit');
INSERT INTO Agent (agentName, agentType, qAbility, eAbility, cAbility, ultimateAbility) VALUES 
('Omen', 'Controller', 'Paranoia', 'Dark Cover', 'Shrouded Step', 'From the Shadows');
INSERT INTO Agent (agentName, agentType, qAbility, eAbility, cAbility, ultimateAbility) VALUES 
('Jett', 'Duelist', 'Updraft', 'Tailwind', 'Cloudburst', 'Blade Storm');
INSERT INTO Agent (agentName, agentType, qAbility, eAbility, cAbility, ultimateAbility) VALUES 
('Spider-Man', 'Avengers', 'Uppercut', 'Wrapping your head', 'Swing Kick', 'Web Punch');
INSERT INTO Agent (agentName, agentType, qAbility, eAbility, cAbility, ultimateAbility) VALUES 
('Mercy', 'Cleric', 'Cure wounds', 'Spirtural Weapon', 'Spirtit Guardian', 'Heroes Never Die');
INSERT INTO Agent (agentName, agentType, qAbility, eAbility, cAbility, ultimateAbility) VALUES 
('Elminster', 'Wizard', 'Fireball', 'Counter Spell', 'Unname', 'Wish');
INSERT INTO Agent (agentName, agentType, qAbility, eAbility, cAbility, ultimateAbility) VALUES 
('Killjoy', 'Sentinel', 'Nanoswarm', 'Alarm Bot', 'Turret', 'Lockdown');
INSERT INTO Agent (agentName, agentType, qAbility, eAbility, cAbility, ultimateAbility) VALUES 
('Phoenix', 'Duelist', 'Curveball', 'Hot Hands', 'Blaze', 'Run It Back');
INSERT INTO Agent (agentName, agentType, qAbility, eAbility, cAbility, ultimateAbility) VALUES 
('Sage', 'Sentinel', 'Slow Orb', 'Healing Orb', 'Barrier Orb', 'Resurrection');

INSERT INTO Region2 (numServers, population) VALUES (42, 42000);
INSERT INTO Region2 (numServers, population) VALUES (10, 10000);
INSERT INTO Region2 (numServers, population) VALUES (30, 30000);
INSERT INTO Region2 (numServers, population) VALUES (23, 23000);
INSERT INTO Region2 (numServers, population) VALUES (28, 28000);
INSERT INTO Region2 (numServers, population) VALUES (15, 15000);
INSERT INTO Region2 (numServers, population) VALUES (35, 35000);

INSERT INTO Region1(regionName, numServers) VALUES ('EMEA', 42);
INSERT INTO Region1(regionName, numServers) VALUES ('Pacific', 10);
INSERT INTO Region1(regionName, numServers) VALUES ('Asia', 30);
INSERT INTO Region1(regionName, numServers) VALUES ('South America', 23);
INSERT INTO Region1(regionName, numServers) VALUES ('North America', 28);
INSERT INTO Region1 (regionName, numServers) VALUES ('Africa', 15);
INSERT INTO Region1 (regionName, numServers) VALUES ('Middle East', 35);

INSERT INTO Match (matchID, startTime, regionName, mapName) VALUES 
(123, TO_TIMESTAMP('2024-07-22 18:32:12', 'YYYY-MM-DD HH24:MI:SS'), 'EMEA', 'Lotus');
INSERT INTO Match (matchID, startTime, regionName, mapName) VALUES 
(456, TO_TIMESTAMP('2024-09-18 22:11:34', 'YYYY-MM-DD HH24:MI:SS'), 'Pacific', 'Haven');
INSERT INTO Match (matchID, startTime, regionName, mapName) VALUES 
(616, TO_TIMESTAMP('2023-12-25 00:20:48', 'YYYY-MM-DD HH24:MI:SS'), 'North America', 'Fracture');
INSERT INTO Match (matchID, startTime, regionName, mapName) VALUES 
(982, TO_TIMESTAMP('2024-09-01 09:25:22', 'YYYY-MM-DD HH24:MI:SS'), 'EMEA', 'Abyss');
INSERT INTO Match (matchID, startTime, regionName, mapName) VALUES 
(438, TO_TIMESTAMP('2024-09-18 22:12:01', 'YYYY-MM-DD HH24:MI:SS'), 'Pacific', 'Sunset');
INSERT INTO Match (matchID, startTime, regionName, mapName) VALUES 
(987, TO_TIMESTAMP('2024-01-15 15:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'Africa', 'Breeze');
INSERT INTO Match (matchID, startTime, regionName, mapName) VALUES 
(654, TO_TIMESTAMP('2024-02-10 20:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'Middle East', 'Icebox');

INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('ABC', 123, 'Cypher', 24, 17, 1, 11);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('PQR', 123, 'Viper', 16, 25, 0, 2);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('XYZ', 456, 'Jett', 8, 25, 0, 5);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('PQR', 456, 'Jett', 31, 9, 1, 2);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('MNO', 123, 'Gekko', 17, 18, 1, 9);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('MNO', 616, 'Spider-Man', 2, 18, 1, 9);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('PBP', 616, 'Spider-Man', 3, 1, 0, 3);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('MRB', 616, 'Elminster', 32, 38, 1, 3);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('DJT', 456, 'Elminster', 23, 3, 0, 3);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('LMN', 987, 'Killjoy', 12, 8, 1, 5);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('FGH', 987, 'Phoenix', 15, 10, 1, 7);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('THR', 654, 'Sage', 20, 5, 1, 10);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('BLK', 654, 'Viper', 18, 7, 0, 4);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('THR', 616, 'Sage', 20, 5, 1, 10);
INSERT INTO PlayedInMatch (riotID, matchID, agentName, kills, deaths, won, assists) VALUES 
('BLK', 616, 'Viper', 18, 7, 0, 4);

INSERT INTO Round (roundNumber, matchId, spikePlanted) VALUES (1, 123, 1);
INSERT INTO Round (roundNumber, matchId, spikePlanted) VALUES (3, 982, 1);
INSERT INTO Round (roundNumber, matchId, spikePlanted) VALUES (6, 456, 0);
INSERT INTO Round (roundNumber, matchId, spikePlanted) VALUES (2, 616, 0);  
INSERT INTO Round (roundNumber, matchId, spikePlanted) VALUES (5, 438, 1);
INSERT INTO Round (roundNumber, matchId, spikePlanted) VALUES (1, 987, 1);
INSERT INTO Round (roundNumber, matchId, spikePlanted) VALUES (2, 987, 0);
INSERT INTO Round (roundNumber, matchId, spikePlanted) VALUES (1, 654, 1);
INSERT INTO Round (roundNumber, matchId, spikePlanted) VALUES (2, 654, 1);

INSERT INTO Team (teamName, color, regionName) VALUES ('Shadow Wizard Money Gang', 'WHITE', 'Asia');
INSERT INTO Team (teamName, color, regionName) VALUES ('Too cool to be Vtubers', 'BLUE', 'North America');
INSERT INTO Team (teamName, color, regionName) VALUES ('Bulletproof Girl', 'PURPLE' , 'Asia');
INSERT INTO Team (teamName, color, regionName) VALUES ('We LOVE Mr. Beast', 'YELLOW' , 'EMEA');
INSERT INTO Team (teamName, color, regionName) VALUES ('Turtles in Ninjas pajamas', 'PINK', 'Pacific');
INSERT INTO Team (teamName, color, regionName) VALUES ('Team Valor', 'RED', 'Africa');
INSERT INTO Team (teamName, color, regionName) VALUES ('Team Frost', 'CYAN', 'Middle East');


INSERT INTO ProPlayer (riotID, jerseyNumber, earnings, signDate, contractLength, teamName) VALUES
('PQR', 10, 430000, TO_TIMESTAMP('2023-03-10 14:12:10', 'YYYY-MM-DD HH24:MI:SS'), 2, 'Shadow Wizard Money Gang');
INSERT INTO ProPlayer (riotID, jerseyNumber, earnings, signDate, contractLength, teamName) VALUES
('XYZ', 42, 114514, TO_TIMESTAMP('2021-11-12 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), 8, 'Too cool to be Vtubers');
INSERT INTO ProPlayer (riotID, jerseyNumber, earnings, signDate, contractLength, teamName) VALUES
('ABC', 31, 1610421, TO_TIMESTAMP('2022-04-21 09:08:23', 'YYYY-MM-DD HH24:MI:SS'), 5, 'Turtles in Ninjas pajamas');
INSERT INTO ProPlayer (riotID, jerseyNumber, earnings, signDate, contractLength, teamName) VALUES
('MNO', 66, 100000000, TO_TIMESTAMP('2023-05-04 07:21:21', 'YYYY-MM-DD HH24:MI:SS'), 8, 'We LOVE Mr. Beast');
INSERT INTO ProPlayer (riotID, jerseyNumber, earnings, signDate, contractLength, teamName) VALUES
('IJK', 25, 239999, TO_TIMESTAMP('2024-02-28 05:12:34', 'YYYY-MM-DD HH24:MI:SS'), 6, 'We LOVE Mr. Beast');
INSERT INTO ProPlayer (riotID, jerseyNumber, earnings, signDate, contractLength, teamName) VALUES
('LMN', 77, 200000, TO_TIMESTAMP('2023-06-15 10:00:00', 'YYYY-MM-DD HH24:MI:SS'), 2, 'We LOVE Mr. Beast');
INSERT INTO ProPlayer (riotID, jerseyNumber, earnings, signDate, contractLength, teamName) VALUES
('FGH', 88, 300000, TO_TIMESTAMP('2020-02-11 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), 3, 'Too cool to be Vtubers');
INSERT INTO ProPlayer (riotID, jerseyNumber, earnings, signDate, contractLength, teamName) VALUES
('DJT', 88, 300000, TO_TIMESTAMP('2023-12-01 12:00:01', 'YYYY-MM-DD HH24:MI:SS'), 4, 'Turtles in Ninjas pajamas');
INSERT INTO ProPlayer (riotID, jerseyNumber, earnings, signDate, contractLength, teamName) VALUES
('DJP', 88, 300000, TO_TIMESTAMP('2023-12-01 12:00:01', 'YYYY-MM-DD HH24:MI:SS'), 4, 'Too cool to be Vtubers');

INSERT INTO Mains (riotID, agentName) VALUES ('PQR', 'Cypher');
INSERT INTO Mains (riotID, agentName) VALUES ('XYZ', 'Gekko');
INSERT INTO Mains (riotID, agentName) VALUES ('ABC', 'Viper');
INSERT INTO Mains (riotID, agentName) VALUES ('MNO', 'Omen');    
INSERT INTO Mains (riotID, agentName) VALUES ('IJK', 'Jett');
INSERT INTO Mains (riotID, agentName) VALUES ('LMN', 'Killjoy');
INSERT INTO Mains (riotID, agentName) VALUES ('FGH', 'Phoenix');
INSERT INTO Mains (riotID, agentName) VALUES ('DJT', 'Sage');
INSERT INTO Mains (riotID, agentName) VALUES ('DJP', 'Spider-Man');
