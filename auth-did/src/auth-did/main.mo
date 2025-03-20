import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Result "mo:base/Result";

actor DIP721NFT {
    type Metadata = {
        name : Text;
        description : Text;
        image : Text;
        email : Text;
        gender : Text;
        mobile : Text;
        dob : Text;
        address : Text;
    };

    type User = {
        name : Text;
        email : Text;
        gender : Text;
        mobile : Text;
        dob : Text;
        address : Text;
    };

    type TransferEvent = {
        from : Principal;
        to : Principal;
        tokenId : Nat;
    };

    type Event = {
        eventId : Nat;
        creator : Principal;
        title : Text;
        description : Text;
        date : Text;
    };

    stable var nftCounter : Nat = 0;
    stable var eventCounter : Nat = 0; // Track events

    stable var tokensEntries : [(Nat, Principal)] = [];
    stable var ownersEntries : [(Principal, [Nat])] = [];
    stable var metadataEntries : [(Nat, Metadata)] = [];
    stable var usersEntries : [(Principal, User)] = [];
    stable var transferEventsEntries : [TransferEvent] = [];
    stable var eventsEntries : [(Nat, Event)] = [];

    var tokens = HashMap.HashMap<Nat, Principal>(10, Nat.equal, Hash.hash);
    var owners = HashMap.HashMap<Principal, [Nat]>(10, Principal.equal, Principal.hash);
    var metadata = HashMap.HashMap<Nat, Metadata>(10, Nat.equal, Hash.hash);
    var users = HashMap.HashMap<Principal, User>(10, Principal.equal, Principal.hash);
    var transferEvents : [TransferEvent] = [];
    var events = HashMap.HashMap<Nat, Event>(10, Nat.equal, Hash.hash);

    system func preupgrade() {
        tokensEntries := Iter.toArray(tokens.entries());
        ownersEntries := Iter.toArray(owners.entries());
        metadataEntries := Iter.toArray(metadata.entries());
        usersEntries := Iter.toArray(users.entries());
        transferEventsEntries := transferEvents;
        eventsEntries := Iter.toArray(events.entries());
    };

    system func postupgrade() {
        tokens := HashMap.fromIter<Nat, Principal>(tokensEntries.vals(), tokensEntries.size(), Nat.equal, Hash.hash);
        owners := HashMap.fromIter<Principal, [Nat]>(ownersEntries.vals(), ownersEntries.size(), Principal.equal, Principal.hash);
        metadata := HashMap.fromIter<Nat, Metadata>(metadataEntries.vals(), metadataEntries.size(), Nat.equal, Hash.hash);
        users := HashMap.fromIter<Principal, User>(usersEntries.vals(), usersEntries.size(), Principal.equal, Principal.hash);
        transferEvents := transferEventsEntries;
        events := HashMap.fromIter<Nat, Event>(eventsEntries.vals(), eventsEntries.size(), Nat.equal, Hash.hash);
    };

    public shared func register(
        user: Principal,
        name: Text, email: Text, gender: Text,
        mobile: Text, dob: Text, address: Text
    ) : async Result.Result<(), Text> {
        if (users.get(user) != null) {
            return #err("User already registered.");
        };
        users.put(user, { name; email; gender; mobile; dob; address });
        #ok(());
    };

    public query func getUser(principal: Principal) : async ?User {
        users.get(principal);
    };

    public shared func mint(
        user: Principal,
        description: Text,
        image: Text
    ) : async Result.Result<Nat, Text> {
        if (user == Principal.fromText("2vxsx-fae")) {
            return #err("Anonymous users cannot mint NFTs. Please connect to Plug Wallet.");
        };

        if (users.get(user) == null) {
            return #err("User not registered.");
        };

        let tokenId = nftCounter;
        nftCounter += 1;

        let userData = switch (users.get(user)) {
            case (?userData) userData;
            case null return #err("User not found.");
        };

        tokens.put(tokenId, user);
        owners.put(user, Array.append(switch (owners.get(user)) { case (?tokenIds) tokenIds; case null [] }, [tokenId]));
        metadata.put(tokenId, {
            name = userData.name;
            description;
            image;
            email = userData.email;
            gender = userData.gender;
            mobile = userData.mobile;
            dob = userData.dob;
            address = userData.address;
        });

        #ok(tokenId);
    };

    public shared ({ caller }) func transfer(to: Principal, tokenId: Nat) : async Bool {
        assert _isApprovedOrOwner(caller, tokenId);
        _transfer(caller, to, tokenId);
        true;
    };

    public query func tokensOfOwner(owner: Principal) : async [Nat] {
        switch (owners.get(owner)) {
            case (?tokenIds) tokenIds;
            case null [];
        };
    };

    public query func balanceOf(owner: Principal) : async Nat {
        switch (owners.get(owner)) {
            case (?tokenIds) tokenIds.size();
            case null 0;
        };
    };

    public query func ownerOf(tokenId: Nat) : async ?Principal {
        tokens.get(tokenId);
    };

    public query func totalSupply() : async Nat {
        tokens.size();
    };

    public query func getMetadata(tokenId: Nat) : async ?Metadata {
        metadata.get(tokenId);
    };

    public shared func updateMetadata(
        user: Principal,
        tokenId: Nat, name: Text, description: Text, image: Text,
        email: Text, gender: Text, mobile: Text, dob: Text, address: Text
    ) : async Bool {
        assert _isOwner(user, tokenId);
        metadata.put(tokenId, { name; description; image; email; gender; mobile; dob; address });
        true;
    };

    // ✅ Create an Event
    public shared func createEvent (user:Principal, title: Text, description: Text, date: Text) : async Result.Result<Nat, Text> {
        if (users.get(user) == null) {
            return #err("User not registered.");
        };

        let eventId = eventCounter;
        eventCounter += 1;

        events.put(eventId, { eventId; creator = user; title; description; date });

        #ok(eventId);
    };

    // ✅ Get All Events
    public query func getAllEvents() : async [Event] {
        Iter.toArray(events.vals());
    };

    func _isOwner(principal: Principal, tokenId: Nat) : Bool {
        switch (tokens.get(tokenId)) {
            case (?owner) owner == principal;
            case null false;
        };
    };

    func _isApprovedOrOwner(spender: Principal, tokenId: Nat) : Bool {
        switch (tokens.get(tokenId)) {
            case (?owner) owner == spender;
            case null false;
        };
    };

    func _transfer(from: Principal, to: Principal, tokenId: Nat) {
        tokens.put(tokenId, to);
        owners.put(from, Array.filter(switch (owners.get(from)) { case (?tokenIds) tokenIds; case null [] }, func(id: Nat) : Bool { id != tokenId }));
        owners.put(to, Array.append(switch (owners.get(to)) { case (?tokenIds) tokenIds; case null [] }, [tokenId]));
        transferEvents := Array.append(transferEvents, [{ from; to; tokenId }]);
    };
};
