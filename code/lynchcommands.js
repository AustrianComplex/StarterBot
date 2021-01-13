const fs = require('fs');
const client = require('../client.js').client();
const Discord = require('discord.js');
const dir = './games'
const admin = require('./administration.js');

/*
Lynch files
-----------

lynchisrunning.txt:     Nothing in file                                 Exists if there is a lynch running
roles.txt:              guildid  roleid                                 Tracks roles that can vote to lynch/be lynched
channels.txt:           channelid                                       Tracks channels that can be voted in
updatechannels.txt:     channelid                                       Tracks channels that updates will be posted in
hostupdatechannels.txt: channelid                                       Tracks channels used for purely host information
votingexceptions.txt:   userid                                          Tracks users that cannot vote
voteableexceptions.txt: userid                                          Tracks users that cannot be voted for
permissions.txt:        lynchvisibility\nspecialvisibility              Tracks user permissions, such as lynch visibility
lynch.txt:              targetid  voter1  voter2  voter3...             Tracks normal voting
speciallynch.txt:       targetid  voter(if applicable)                  Tracks additional votes being used
votecap.txt:            votesneeded                                     Tracks the required number of votes for lynch


Requirements
----------------------

Start a Lynch:
Must be triggered by a host
At least one channel to post updates in
At least one role to lynch/be lynched
A means to calculate required number of votes
A means to assign required number of votes to votecap.txt

Post Vote Counts:
Lynch must be running
At least one channel to post updates in
A means to get lynch visibility level
A means to get special lynch visibility level
A means to retrieve all votes in lynch.txt
A means to retrieve all votes in speciallynch.txt

Cast Lynch Vote:
Lynch must be running
A means to check if vote was cast in a valid channel
A means to check if voting member has a lynch role
A means to check if the voting member is currently not excepted from being able to vote
A means to check if the target is currently not excepted from being voted for
A means to check if the voter has cast a vote before
A means to remove a vote from lynch.txt if it has been cast
A means to add a vote to lynch.txt

Uncast Lynch Vote:
Lynch must be running
A means to check if command was made in a valid channel
A means to check if the voter has cast a vote before
A means to remove a vote from lynch.txt if it has been cast

Cast Special Lynch Vote:
Lynch must be running
Must be cast by a host
A means to return a list of possible targets
A means to return a list of possible voters
A means to add a vote to speciallynch.txt

Uncast Special Lynch Vote:
Lynch must be running
Must be uncast by a host
A means to return a list of current votes in speciallynch.txt and their casters
A means to remove a vote from special.txt by index

End Lynch:
Lynch must be running
At least one channel to post updates in
A means to calculate each time a vote or special vote is cast whether the vote cap has been reached
A means to end the lynch running
A means to end the lynch with a specified target

Modifiable Settings
------------------
Must be able to return a list of all currently eligible voters
Lynch visibility must be able to be modified
Special lynch visibility must be able to be modified
Voting exceptions must be able to be added
Must be able to return a list of voting exceptions
Must be able to remove a voting exception
Voteable exceptions must be able to be added
Must be able to return a list of voteable exceptions
Must be able to remove a voteable exception
Must be able to add an update channel
Must be able to remove an update channel
Must be able to add a voting channel
Must be able to remove a voting channel
Must be able to add a voting role
Must be able to remove a voting role
Must be able to manually adjust the voting cap



Things Resolved By Create Game
------------------------------

Empty roles.txt file created.
Empty channels.txt file created.
Empty votingexceptions.txt file created.
Empty voteableexceptions.txt file created.
Empty updatechannels.txt file created.
Empty votecap.txt file created.
permissions.txt file created with default lynch and special lynch visibility.

Permissions
-----------
Lynch visibility:
0 = invisible
1 = visible (default)

Special lynch visibility
0 = invisible (default)
1 = votes visible, but not targets or casters
2 = votes and targets visible, but not casters
3 = visible

Table of Contents:
(0) Start Lynch and Management Commands: 174
(1) Voting Roles/Players Commands: 278
(2) Player Lynch Commands: 416
(3) Special Lynch Commands: 459
(4) Channel Commands: 489
(5) Votecount Commands: 557
Helpers: 690
*/

/*
0: START LYNCH AND MANAGEMENT COMMANDS
*/

var startlynch = function(gameid, necessaryvotes=-1)
{
    //the setup must be valid
    if(!validsetup(gameid))
        return false;

    //set the vote cap
    var requiredvotes = necessaryvotes;
    if(necessaryvotes == -1)
        requiredvotes = calculatevotesneeded(gameid);
    setvotecap(gameid, requiredvotes);

    //create lynch files
    fs.writeFileSync(`${dir}/${gameid}/lynching/lynch.txt`, "");
    fs.writeFileSync(`${dir}/${gameid}/lynching/speciallynch.txt`, "");

    //create running file
    fs.writeFileSync(`${dir}/${gameid}/lynching/lynchisrunning.txt`, "");

    //send an update
    var updatechannels = getupdatechannels(gameid);
    for(var i = 0; i < updatechannels.length; i++)
    {
        updatechannels[i].send(`**Voting has begun!**\n*It currently requires ${requiredvotes} to lynch!*`);
    }

    return true;
}

var cancellynch = function(gameid)
{
    if(!lynchisrunning(gameid))
        return;

    var updatechannels = getupdatechannels(gameid);
    for(var i = 0; i < updatechannels.length; i++)
    {
        updatechannels[i].send(`**VOTING HAS BEEN CANCELLED!**`);
    }

    resolvefiles(gameid);
}

var resetlynch = function(gameid)
{
    if(!lynchisrunning(gameid))
        return;

    var updatechannels = getupdatechannels(gameid);
    for(var i = 0; i < updatechannels.length; i++)
    {
        updatechannels[i].send(`**VOTING HAS BEEN RESET!**`);
    }

    clearvotes(gameid);
}

var endnolynch = function(gameid)
{
    var updatechannels = getupdatechannels(gameid);
    for(var i = 0; i < updatechannels.length; i++)
    {
        updatechannels[i].send(`**VOTING HAS ENDED!**`);
    }

    var votinginformation = getFullVotes(gameid);
    var votingstring = convertVotesToString(votinginformation);

    var gamename = admin.getName(gameid);

    var informationstring = `Voting was concluded for game "${gamename}" with no lynch being performed!\n\n` +
                            `\`\`\`Final Votes:\n\n${votingstring}\`\`\``;

    updateHosts(gameid, informationstring);

    resolvefiles(gameid);
}

var hammer = function(gameid, targetid)
{
    var updatechannels = getupdatechannels(gameid);
    for(var i = 0; i < updatechannels.length; i++)
    {
        updatechannels[i].send(`**VOTING HAS ENDED!**`);
    }

    var votinginformation = getFullVotes(gameid);
    var votingstring = convertVotesToString(votinginformation);

    var gamename = admin.getName(gameid);
    
    var informationstring = `Voting was concluded for game "${gamename}" with <@${targetid}> being lynched!\n\n` +
                            `\`\`\`Final Votes:\n\n${votingstring}\`\`\``;

    updateHosts(gameid, informationstring);

    resolvefiles(gameid);

}

var getemoji = function(gameid)
{
    var emoji = fs.readFileSync(`${dir}/${gameid}/lynching/emoji.txt`).toString();
    return emoji;
}

var setemoji = function(gameid, emoji)
{
    fs.writeFileSync(`${dir}/${gameid}/lynching/emoji.txt`, emoji);
    return;
}

/*
1: VOTING ROLES AND PLAYERS COMMANDS
*/

var addlynchrole = function(gameid, guildid, roleid)
{
    //make sure role isn't already in the file
    var rawroledata = fs.readFileSync(`${dir}/${gameid}/lynching/roles.txt`).toString();
    var roledata = rawroledata.split("\n");
    for(var i = 0; i < (roledata.length - 1); i++)
    {
        if(`${guildid}  ${roleid}` == roledata[i])
            return;
    }

    //add role to end of file
    fs.writeFileSync(`${dir}/${gameid}/lynching/roles.txt`, `${rawroledata}${guildid}  ${roleid}\n`);
}

var removelynchrole = function(gameid, guildid, roleid)
{
    var rawroledata = fs.readFileSync(`${dir}/${gameid}/lynching/roles.txt`).toString();
    rawroledata = rawroledata.replace(`${guildid}  ${roleid}\n`, "");
    fs.writeFileSync(`${dir}/${gameid}/lynching/roles.txt`, rawroledata);
}

var getroles = function(gameid){
    cleanseroles(gameid);

    var rolearray = [];
    var rawroledata = fs.readFileSync(`${dir}/${gameid}/lynching/roles.txt`).toString().split("\n");

    for(var i = 0; i < (rawroledata.length - 1); i++)
    {
        try{
            var current = rawroledata[i].split("  ");
            var guild = client.guilds.cache.get(current[0]);
            var role = guild.roles.cache.get(current[1]);
            rolearray.push(role);
        }
        catch(err){
            console.log(`Lynch getroles error:\n${err}`);
        }
    }
    return rolearray;
}

var cleanseroles = function(gameid)
{
    var rawroles = fs.readFileSync(`${dir}/${gameid}/lynching/roles.txt`).toString();
    var roles = rawroles.split("\n");
    for(var i = 0; i < roles.length; i++)
    {
        try{
            var current = roles[i].split("  ");
            var guild = client.guilds.cache.get(current[0]);
            var role = guild.roles.cache.get(current[1]);
            if(role == undefined)
                rawroles = rawroles.replace(`${roles[i]}\n`, "");
        }
        catch(error)
        {
            rawroles.replace(`${roles[i]}\n`, "");
        }
    }
    fs.writeFileSync(`${dir}/${gameid}/lynching/roles.txt`, rawroles);
}

var addvotingexception = function(gameid, userid)
{
    //make sure user isn't already in the file
    var rawuserdata = fs.readFileSync(`${dir}/${gameid}/lynching/votingexceptions.txt`);
    var userdata = rawuserdata.toString().split("\n");
    for(var i = 0; i < (userdata.length - 1); i++)
    {
        if(`${userid}` == userdata[i])
            return;
    }

    //add user to end of file
    fs.writeFileSync(`${dir}/${gameid}/lynching/votingexceptions.txt`, `${rawuserdata}${userid}\n`);
}

var addvoteableexception = function(gameid, userid)
{
    //make sure user isn't already in the file
    var rawuserdata = fs.readFileSync(`${dir}/${gameid}/lynching/voteableexceptions.txt`);
    var userdata = rawuserdata.toString().split("\n");
    for(var i = 0; i < (userdata.length - 1); i++)
    {
        if(`${userid}` == userdata[i])
            return;
    }

    //add user to end of file
    fs.writeFileSync(`${dir}/${gameid}/lynching/voteableexceptions.txt`, `${rawuserdata}${userid}\n`);
}

var removevotingexception = function(gameid, userid)
{
    var rawuserdata = fs.readFileSync(`${dir}/${gameid}/lynching/votingexceptions.txt`).toString();
    rawuserdata = rawuserdata.replace(`${userid}\n`, "");
    fs.writeFileSync(`${dir}/${gameid}/lynching/votingexceptions.txt`, rawuserdata);
}

var removevoteableexception = function(gameid, userid)
{
    var rawuserdata = fs.readFileSync(`${dir}/${gameid}/lynching/voteableexceptions.txt`).toString();
    rawuserdata = rawuserdata.replace(`${userid}\n`, "");
    fs.writeFileSync(`${dir}/${gameid}/lynching/voteableexceptions.txt`, rawuserdata);
}

var cleansevotingexceptions = function(gameid)
{
    var rawexceptions = fs.readFileSync(`${dir}/${gameid}/lynching/votingexceptions.txt`).toString();
    var exceptions = rawexceptions.split("\n");
    for(var i = 0; i < exceptions.length; i++)
    {
        try
        {
            var user = client.users.cache.get(exceptions[i]);
            if(user == undefined)
            {
                rawexceptions = rawexceptions.replace(`${exceptions[i]}\n`, "");
            }
        }
        catch(error)
        {
            rawexceptions = rawexceptions.replace(`${exceptions[i]}\n`, "");
        }
    }
    fs.writeFileSync(`${dir}/${gameid}/lynching/votingexceptions.txt`, rawexceptions);
}

var cleansevoteableexceptions = function(gameid)
{
    var rawexceptions = fs.readFileSync(`${dir}/${gameid}/lynching/voteableexceptions.txt`).toString();
    var exceptions = rawexceptions.split("\n");
    for(var i = 0; i < exceptions.length; i++)
    {
        try
        {
            var user = client.users.cache.get(exceptions[i]);
            if(user == undefined)
            {
                rawexceptions = rawexceptions.replace(`${exceptions[i]}\n`, "");
            }
        }
        catch(error)
        {
            rawexceptions = rawexceptions.replace(`${exceptions[i]}\n`, "");
        }
    }
    fs.writeFileSync(`${dir}/${gameid}/lynching/voteableexceptions.txt`, rawexceptions);
}

var isVoter = function(gameid, userid)
{
    var votingpermissions = false;

    //check if member of a voting role
    var rawvotingids = fs.readFileSync(`${dir}/${gameid}/lynching/roles.txt`).toString().split("\n");
    for(var i = 0; i < (rawvotingids.length - 1); i++)
    {
        try
        {
            var guildid = rawvotingids[i].split("  ")[0];
            var roleid = rawvotingids[i].split("  ")[1];
            var guild = client.guilds.cache.get(guildid);
            var role = guild.roles.cache.get(roleid);
            if(role.members.get(userid))
                votingpermissions = true;
        }
        catch(error)
        {
            console.log(error);
        }
    }

    //check if member is not able to vote
    var rawexceptionids = fs.readFileSync(`${dir}/${gameid}/lynching/votingexceptions.txt`).toString().split("\n");
    for(var i = 0; i < (rawexceptionids.length - 1); i++)
    {
        if(rawexceptionids[i] == userid)
            return false;
    }

    return votingpermissions;
}

var isVotable = function(gameid, userid)
{
    var votingpermissions = false;

    //check if member of a voting role
    var rawvotingids = fs.readFileSync(`${dir}/${gameid}/lynching/roles.txt`).toString().split("\n");
    for(var i = 0; i < (rawvotingids.length - 1); i++)
    {
        try
        {
            var guildid = rawvotingids[i].split("  ")[0];
            var roleid = rawvotingids[i].split("  ")[1];
            var guild = client.guilds.cache.get(guildid);
            var role = guild.roles.cache.get(roleid);
            if(role.members.get(userid))
                votingpermissions = true;
        }
        catch(error)
        {
            console.log(error);
        }
    }

    //check if member is not able to vote
    var rawexceptionids = fs.readFileSync(`${dir}/${gameid}/lynching/voteableexceptions.txt`).toString().split("\n");
    for(var i = 0; i < (rawexceptionids.length - 1); i++)
    {
        if(rawexceptionids[i] == userid)
            return false;
    }

    return votingpermissions;
}

/*
2: PLAYER LYNCH COMMANDS
*/

var lynch = function(gameid, targetid, voterid)
{
    if(!lynchisrunning(gameid))
        return false;

    if(!verifyvoter(gameid, voterid))
        return false;

    if(!verifyvotable(gameid, targetid))
        return false;

    removenormalvote(gameid, voterid);
    var returnvalue = addnormalvote(gameid, targetid, voterid);

    if(checkforhammer(gameid, targetid))
    {
        hammer(gameid, targetid);
    }

    return returnvalue;
}

var unlynch = function(gameid, voterid)
{
    if(!lynchisrunning(gameid))
        return false;

    return removenormalvote(gameid, voterid);
}

var nolynch = function(gameid, voterid)
{
    if(!lynchisrunning(gameid))
        return false;

    if(!verifyvoter(gameid, voterid))
        return false;

    removenormalvote(gameid, voterid);
    var returnvalue = addnormalvote(gameid, 0, voterid);

    if(checkforhammer(gameid, 0))
    {
        endnolynch(gameid);
    }

    return returnvalue;
}


/*
3: SPECIAL LYNCH COMMANDS
*/

var speciallynch = function(gameid, targetid, voterid=-1)
{
    //check for running lynch
    if(!lynchisrunning(gameid))
        return;

    if(!verifyvotable(gameid, targetid))
        return;

    //add vote
    addspecialvote(gameid, targetid, voterid);

    //check for hammer
    if(checkforhammer(gameid, targetid))
    {
        hammer(gameid, targetid);
    }
}

var unspeciallynch = function(gameid, targetid, voterid=-1)
{
    removespecialvotebyids(gameid, targetid, voterid)
}

var unspeciallynchindex = function(gameid, index)
{
    removespecialvotebyindex(gameid, index);
}

/*
4: CHANNEL COMMANDS
*/

var addupdatechannel = function(gameid, channelid)
{
    //make sure channel isn't already in the file
    var rawchanneldata = fs.readFileSync(`${dir}/${gameid}/lynching/updatechannels.txt`);
    var channeldata = rawchanneldata.toString().split("\n");
    for(var i = 0; i < (channeldata.length - 1); i++)
    {
        if(`${channelid}` == channeldata[i])
            return;
    }

    //add channel to end of file
    fs.writeFileSync(`${dir}/${gameid}/lynching/updatechannels.txt`, `${rawchanneldata}${channelid}\n`);
}

var removeupdatechannel = function(gameid, channelid)
{
    var rawchanneldata = fs.readFileSync(`${dir}/${gameid}/lynching/updatechannels.txt`).toString();
    rawchanneldata = rawchanneldata.replace(`${channelid}\n`, "");
    fs.writeFileSync(`${dir}/${gameid}/lynching/updatechannels.txt`, rawchanneldata);
}

var getupdatechannels = function(gameid)
{
    cleanseUpdateChannels(gameid);

    var channels = [];
    var rawchanneldata = fs.readFileSync(`${dir}/${gameid}/lynching/updatechannels.txt`).toString().split("\n");

    for(var i = 0; i < (rawchanneldata.length - 1); i++)
    {
        try{
            var channel = client.channels.cache.get(rawchanneldata[i]);
            channels.push(channel);
        }
        catch(err){
            console.log(`Lynch getupdatechannels error:\n${err}`);
        }
    }
    return channels;
}

var cleanseUpdateChannels = function(gameid)
{
    var rawchannels = fs.readFileSync(`${dir}/${gameid}/lynching/updatechannels.txt`).toString();
    var channels = rawchannels.split("\n");
    {
        for(var i = 0; i < (channels.length - 1); i++)
        {
            try{
                var channel = client.channels.cache.get(channels[i]);
                if(channel == undefined)
                {
                    rawchannels = rawchannels.replace(`${channels[i]}\n`, "");
                }
            }
            catch(error)
            {
                rawchannels = rawchannels.replace(`${channels[i]}\n`, "");
            }
        }
    }
    fs.writeFileSync(`${dir}/${gameid}/lynching/updatechannels.txt`, rawchannels);
}

var addvotingchannel = function(gameid, channelid)
{
    //make sure channel isn't already in the file
    var rawchanneldata = fs.readFileSync(`${dir}/${gameid}/lynching/channels.txt`);
    var channeldata = rawchanneldata.toString().split("\n");
    for(var i = 0; i < (channeldata.length - 1); i++)
    {
        if(`${channelid}` == channeldata[i])
            return;
    }

    //add channel to end of file
    fs.writeFileSync(`${dir}/${gameid}/lynching/channels.txt`, `${rawchanneldata}${channelid}\n`);
}

var removevotingchannel = function(gameid, channelid)
{
    var rawchanneldata = fs.readFileSync(`${dir}/${gameid}/lynching/channels.txt`).toString();
    rawchanneldata = rawchanneldata.replace(`${channelid}\n`, "");
    fs.writeFileSync(`${dir}/${gameid}/lynching/channels.txt`, rawchanneldata);
}

var getchannels = function(gameid){

    cleanseVotingChannels(gameid);

    var channels = [];
    var rawchanneldata = fs.readFileSync(`${dir}/${gameid}/lynching/channels.txt`).toString().split("\n");

    for(var i = 0; i < (rawchanneldata.length - 1); i++)
    {
        try{
            var channel = client.channels.cache.get(rawchanneldata[i]);
            channels.push(channel);
        }
        catch(err){
            console.log(`Lynch getchannels error:\n${err}`);
        }
    }
    return channels;
}

var cleanseVotingChannels = function(gameid)
{
    var rawchannels = fs.readFileSync(`${dir}/${gameid}/lynching/channels.txt`).toString();
    var channels = rawchannels.split("\n");
    {
        for(var i = 0; i < (channels.length - 1); i++)
        {
            try{
                var channel = client.channels.cache.get(channels[i]);
                if(channel == undefined)
                {
                    rawchannels = rawchannels.replace(`${channels[i]}\n`, "");
                }
            }
            catch(error)
            {
                rawchannels = rawchannels.replace(`${channels[i]}\n`, "");
            }
        }
    }
    fs.writeFileSync(`${dir}/${gameid}/lynching/channels.txt`, rawchannels);
}

var printToUpdateChannels = function(gameid, string)
{
    var channels = getupdatechannels(gameid);
    for(var i = 0; i < channels.length; i++)
    {
        channels[i].send(string);
    }
}

var isboundchannel = function(gameid, channelid)
{
    var channels = getchannels(gameid);

    //search for if bound channel
    for(var i = 0; i < channels.length; i++)
    {
        if(channelid == channels[i].id)
            return true;
    }

    //if there are no bound channels, automatically true
    if(channels.length == 0)
        return true;

    //not a bound channel
    return false;
}

/*
5: VOTE COUNT COMMANDS
*/

var getvotes = function(gameid){
    if(!lynchisrunning(gameid))
        return -1;

    var normalvisibility = getlynchvisibility(gameid);
    var specialvisibility = getspecialvisibility(gameid);

    var votes = [];
    var specialvotes = [];

    switch(normalvisibility){
        case '0':
            break;
        case '1':
            votes = getnormalvotes(gameid);
            break;
    }

    switch(specialvisibility){
        case '0':
            break;
        case '1':
            specialvotes = getspecialvotes(gameid);
            votes[votes.length] = [-1, specialvotes.length];
            break;
        case '2':
            specialvotes = getspecialvotes(gameid);

            //for each specialvote...
            for(var i = 0; i < specialvotes.length; i++)
            {
                //search for target in votes...
                var found = false;
                for(var j = 0; j < votes.length; j++)
                {
                    //found the target
                    if(specialvotes[i][0] == votes[j][0])
                    {
                        //identity of voter secret but add hidden voter
                        votes[j][votes[j].length] = -1;
                        found = true;
                    }
                }

                //special vote's target not found, add to list
                if(found == false)
                    votes[votes.length] = [specialvotes[i][0], -1];
            }
            break;
        case '3':
            specialvotes = getspecialvotes(gameid);

            //for each specialvote...
            for(var i = 0; i < specialvotes.length; i++)
            {
                //search for target in votes...
                var found = false;
                for(var j = 0; j < votes.length; j++)
                {
                    //found the target
                    if(specialvotes[i][0] == votes[j][0])
                    {
                        //identity of voter revealed
                        if(specialvotes[i].length > 1)
                            votes[j][votes[j].length] = specialvotes[i][1];
                        else
                            votes[j][votes[j].length] = -1;
                        found = true;
                    }
                }

                //special vote's target not found, add to list
                if(found == false)
                {
                    if(specialvotes[i].length > 1)
                        votes[votes.length] = [specialvotes[i][0], specialvotes[i][1]];
                    else
                        votes[votes.length] = [specialvotes[i][0], -1];
                }
            }
            break;
    }

    return votes;
}

var getFullVotes = function(gameid)
{
    if(!lynchisrunning(gameid))
        return -1;

    var votes = [];
    var specialvotes = [];

    votes = getnormalvotes(gameid);
    specialvotes = getspecialvotes(gameid);

    //for each specialvote...
    for(var i = 0; i < specialvotes.length; i++)
    {
        //search for target in votes...
        var found = false;
        for(var j = 0; j < votes.length; j++)
        {
            //found the target
            if(specialvotes[i][0] == votes[j][0])
            {
                //identity of voter revealed
                if(specialvotes[i].length > 1)
                    votes[j][votes[j].length] = specialvotes[i][1];
                else
                    votes[j][votes[j].length] = -1;
                found = true;
            }
        }

        //special vote's target not found, add to list
        if(found == false)
        {
            if(specialvotes[i].length > 1)
                votes[votes.length] = [specialvotes[i][0], specialvotes[i][1]];
            else
                votes[votes.length] = [specialvotes[i][0], -1];
        }
    }

    return votes;
}

var convertVotesToString = function(votes)
{
    var string = "";

    //for each target...
    for(var i = 0; i < votes.length; i++)
    {
        //add target
        var votecount = votes[i].length - 1;
        var continuewithvote = true;
        if(votes[i][0] == 0)
        {
            string += `No Lynch: ${votecount} (`;
        }
        else if(votes[i][0] == -1)
        {
            string += `???: ${votes[i][1]}`;
            continuewithvote = false;
        }
        else
        {
            var user = client.users.cache.get(votes[i][0]);
            string += `${user.username}#${user.discriminator}: ${votecount} (`;
        }

        //add voters
        if(continuewithvote)
        {
            for(var j = 1; j < votes[i].length; j++)
            {
                if(votes[i][j] != -1)
                {
                    var user = client.users.cache.get(votes[i][j]);
                    string += ` ${user.username}#${user.discriminator}`;
                }
            }
            string += " )\n";
        }
    }

    //return votestring
    return string;
}

/*
HELPERS
*/

var resolvefiles = function(gameid)
{
    fs.unlinkSync(`${dir}/${gameid}/lynching/lynchisrunning.txt`);
    fs.unlinkSync(`${dir}/${gameid}/lynching/lynch.txt`);
    fs.unlinkSync(`${dir}/${gameid}/lynching/speciallynch.txt`);
    fs.writeFileSync(`${dir}/${gameid}/lynching/votecap.txt`, "");
}

var clearvotes = function(gameid)
{
    fs.writeFileSync(`${dir}/${gameid}/lynching/lynch.txt`, "");
    fs.writeFileSync(`${dir}/${gameid}/lynching/speciallynch.txt`, "");
}

//tset if the lynch can be started or not. true if it can false otherwise
var validsetup = function(gameid)
{
    //require at least one lynchable role and one update channel
    if(getroles(gameid).length > 0 && getupdatechannels(gameid).length > 0)
        return true;
    return false;
}

//calculates the majority from the members of the given lynch roles. assumes no special voting
var calculatevotesneeded = function(gameid)
{
    //fetch the roles
    var roles = getroles(gameid);

    //setup a count and a user list
    var votecount = 0;
    var userlist = [];

    //go through every highlighted role
    for(var i = 0; i < roles.length; i++)
    {
        //get array of members with this role
        rolemembers = roles[i].members.array();

        //go through each member
        for(var j = 0; j < rolemembers.length; j++)
        {
            //test if a member has already been added to the count
            var notadded = true;
            for(var k = 0; k < userlist.length; k++)
            {
                if(userlist[k] == rolemembers[j])
                    notadded = false;
            }

            //if a member has not been added, add them
            if(notadded == true)
            {
                userlist[userlist.length] = rolemembers[j];
                votecount++;
            }
        }
    }

    //get majority of vote count
    if(votecount % 2 == 1)
        return ((votecount + 1) / 2);
    return ((votecount + 2) / 2);
}

var verifyvoter = function(gameid, voterid)
{
    var votingroles = getroles(gameid);
    for(var i = 0; i < votingroles.length; i++)
    {
        var memberlist = votingroles[i].members.array();
        for(var j = 0; j < memberlist.length; j++)
        {
            if(memberlist[j].id == voterid)
                return true;
        }
    }
    return false;
}

var verifyvotable = function(gameid, votedid)
{
    var votingroles = getroles(gameid);
    for(var i = 0; i < votingroles.length; i++)
    {
        var memberlist = votingroles[i].members.array();
        for(var j = 0; j < memberlist.length; j++)
        {
            if(memberlist[j].id == votedid)
                return true;
        }
    }
    return false;
}

var checkforhammer = function(gameid, targetid)
{
    //no lynch running, instantly false
    if(!lynchisrunning(gameid))
        return false;

    //get votecount for target
    var votecount = 0;
    votecount += normalvotecountfortarget(gameid, targetid);
    votecount += specialvotecountfortarget(gameid, targetid);

    //if the vote has hammered return true
    if(votecount >= getvotecap(gameid))
        return true;

    //vote hasn't hammered
    return false;
}

var lynchisrunning = function(gameid){
    return fs.existsSync(`${dir}/${gameid}/lynching/lynchisrunning.txt`);
}

var getvotecap = function(gameid)
{
    var votecapstr = fs.readFileSync(`${dir}/${gameid}/lynching/votecap.txt`).toString();
    if(votecapstr.match(/\d+/) == 0)
        return -1;
    return votecapstr;
}

var getvotingexceptions = function(gameid)
{
    cleansevotingexceptions(gameid);
    var exceptions = [];
    var rawexceptiondata = fs.readFileSync(`${dir}/${gameid}/lynching/votingexceptions.txt`).toString().split("\n");
    for(var i = 0; i < (rawexceptiondata.length - 1); i++)
    {
        exceptions[i] = rawexceptiondata[i];
    }
    return exceptions;
}

var getvoteableexceptions = function(gameid)
{
    cleansevoteableexceptions(gameid);
    var exceptions = [];
    var rawexceptiondata = fs.readFileSync(`${dir}/${gameid}/lynching/voteableexceptions.txt`).toString().split("\n");
    for(var i = 0; i < (rawexceptiondata.length - 1); i++)
    {
        exceptions[i] = rawexceptiondata[i];
    }
    return exceptions;
}

var getlynchvisibility = function(gameid)
{
    var permissions = fs.readFileSync(`${dir}/${gameid}/lynching/permissions.txt`).toString().split("\n");
    return permissions[0];
}

var getspecialvisibility = function(gameid)
{
    var permissions = fs.readFileSync(`${dir}/${gameid}/lynching/permissions.txt`).toString().split("\n");
    return permissions[1];
}

var normalvotecountfortarget = function(gameid, targetid)
{
    if(!lynchisrunning(gameid))
        return 0;

    var lynchdata = fs.readFileSync(`${dir}/${gameid}/lynching/lynch.txt`).toString().split("\n");
    for(var i = 0; i < (lynchdata.length - 1); i++)
    {
        var current = lynchdata[i].split("  ");
        if(current[0] == targetid)
        {
            return current.length - 1;
        }
    }
    return 0;
}

var getnormalvotes = function(gameid)
{
    if(!lynchisrunning(gameid))
        return 0;

    var votearray = [];
    var lynchdata = fs.readFileSync(`${dir}/${gameid}/lynching/lynch.txt`).toString().split("\n");
    for(var i = 0; i < (lynchdata.length - 1); i++)
    {
        var current = lynchdata[i].split("  ");
        votearray.push(current);
    }

    return votearray;
}

var specialvotecountfortarget = function(gameid, targetid)
{
    if(!lynchisrunning(gameid))
        return 0;

    var lynchdata = fs.readFileSync(`${dir}/${gameid}/lynching/speciallynch.txt`).toString().split("\n");
    var votecount = 0;
    for(var i = 0; i < (lynchdata.length - 1); i++)
    {
        var current = lynchdata[i].split("  ");
        if(current[0] == targetid)
            votecount++;
    }
    return votecount;
}

var getspecialvotes = function(gameid)
{
    if(!lynchisrunning(gameid))
        return 0;

    var votearray = [];
    var lynchdata = fs.readFileSync(`${dir}/${gameid}/lynching/speciallynch.txt`).toString().split("\n");
    for(var i = 0; i < (lynchdata.length - 1); i++)
    {
        var current = lynchdata[i].split("  ");
        if(current.length == 2)
            votearray[i] = [current[0], current[1]];
        else
            votearray[i] = [current[0]];
    }

    return votearray;
}

var setlynchvisibility = function(gameid, newvisibility)
{
    var permissions = fs.readFileSync(`${dir}/${gameid}/lynching/permissions.txt`).toString().split("\n");
    permissions[0] = newvisibility.toString();
    fs.writeFileSync(`${dir}/${gameid}/lynching/permissions.txt`, `${permissions[0]}\n${permissions[1]}`);
}

var setspecialvisibility = function(gameid, newvisibility)
{
    var permissions = fs.readFileSync(`${dir}/${gameid}/lynching/permissions.txt`).toString().split("\n");
    permissions[1] = newvisibility.toString();
    fs.writeFileSync(`${dir}/${gameid}/lynching/permissions.txt`, `${permissions[0]}\n${permissions[1]}`);
}

var setvotecap = function(gameid, newcap)
{
    fs.writeFileSync(`${dir}/${gameid}/lynching/votecap.txt`, `${newcap}`);
}

var addnormalvote = function(gameid, targetid, voterid)
{
    //lynch must be running
    if(!lynchisrunning(gameid))
        return false;

    //get lynch data
    var rawlynchdata = fs.readFileSync(`${dir}/${gameid}/lynching/lynch.txt`).toString();
    var lynchdata = rawlynchdata.split("\n");

    //for each target...
    for(var i = 0; i < (lynchdata.length - 1); i++)
    {
        //split into target and voters
        var current = lynchdata[i].split("  ");

        //if found target
        if(current[0] == targetid)
        {
            //add voter to end of list
            lynchdata[i] = lynchdata[i].concat(`  ${voterid}`);

            //readd data to file
            var newdata = "";
            for(var j = 0; j < (lynchdata.length - 1); j++)
            {
                newdata += `${lynchdata[j]}\n`;
            }
            fs.writeFileSync(`${dir}/${gameid}/lynching/lynch.txt`, newdata);

            return true;
        }
    }

    //create new target and add to file
    fs.appendFileSync(`${dir}/${gameid}/lynching/lynch.txt`, `${targetid}  ${voterid}\n`);

    return true;
}

var removenormalvote = function(gameid, voterid)
{
    //lynch must be running
    if(!lynchisrunning(gameid))
        return false;

    //get lynch data
    var rawlynchdata = fs.readFileSync(`${dir}/${gameid}/lynching/lynch.txt`).toString();
    var lynchdata = rawlynchdata.split("\n");
    
    //find lynch with vote
    for(var i = 0; i < (lynchdata.length - 1); i++)
    {
        var current = lynchdata[i].split("  ");
        for(var j = 1; j < current.length; j++)
        {
            if(current[j] == voterid)
            {
                if(current.length == 2)
                    rawlynchdata = rawlynchdata.replace(`${lynchdata[i]}\n`, "");
                else
                    rawlynchdata = rawlynchdata.replace(`  ${voterid}`, "");
            }
        }
    }

    //write lynch data back
    fs.writeFileSync(`${dir}/${gameid}/lynching/lynch.txt`, rawlynchdata);

    return true;
}

var addspecialvote = function(gameid, targetid, voterid=-1)
{
    //lynch must be running
    if(!lynchisrunning(gameid))
        return;

    //take lynch information and add new vote to end
    fs.appendFileSync(`${dir}/${gameid}/lynching/speciallynch.txt`, `${targetid}  ${voterid}\n`);
}

var removespecialvotebyids = function(gameid, targetid, voterid=-1)
{
    if(!lynchisrunning(gameid))
        return;

    //get special lynch data
    var rawspecialdata = fs.readFileSync(`${dir}/${gameid}/lynching/speciallynch.txt`).toString();

    //remove first vote that matches criteria
    rawspecialdata = rawspecialdata.replace(`${targetid}  ${voterid}\n`, "");

    //write to file
    fs.writeFileSync(`${dir}/${gameid}/lynching/speciallynch.txt`, rawspecialdata)
}

var removespecialvotebyindex = function(gameid, index)
{
    //lynch must be running
    if(!lynchisrunning(gameid))
        return false;

    //get special lynch data
    var rawspecialdata = fs.readFileSync(`${dir}/${gameid}/lynching/speciallynch.txt`).toString();
    var specialdata = rawspecialdata.split("\n");
    
    //index out of range
    if(index >= (specialdata.length - 1))
        return false;

    //replace at index and write to file
    rawspecialdata = rawspecialdata.replace(`${specialdata[index]}\n`, '');
    fs.writeFileSync(`${dir}/${gameid}/lynching/speciallynch.txt`, rawspecialdata);

    return true;
}

module.exports = {
    //0 Lynch Start and Management Commands
    startlynch: startlynch,
    cancellynch: cancellynch,
    resetlynch: resetlynch,
    endnolynch: endnolynch,
    hammer: hammer,
    setlynchvisibility: setlynchvisibility,
    setspecialvisibility: setspecialvisibility,
    setemoji: setemoji,
    getemoji: getemoji,

    //1 Voting Roles/Players Commands
    addlynchrole: addlynchrole,
    removelynchrole: removelynchrole,
    getroles: getroles,
    addvoteableexception: addvoteableexception,
    addvotingexception: addvotingexception,
    removevoteableexception: removevoteableexception,
    removevotingexception: removevotingexception,
    isVoter: isVoter,
    isVotable: isVotable,

    //2 Player Lynching Commands
    lynch: lynch,
    unlynch: unlynch,
    nolynch: nolynch,

    //3 Special Lynch Commands
    speciallynch: speciallynch,
    unspeciallynch: unspeciallynch,

    //4 Channel Commands
    addupdatechannel: addupdatechannel,
    removeupdatechannel: removeupdatechannel,
    getupdatechannels: getupdatechannels,
    addvotingchannel: addvotingchannel,
    removevotingchannel: removevotingchannel,
    getchannels: getchannels,
    printToUpdateChannels: printToUpdateChannels,
    isboundchannel: isboundchannel,

    //5 Votecount Commands
    getvotes: getvotes,
    getFullVotes: getFullVotes,
    convertVotesToString: convertVotesToString
}