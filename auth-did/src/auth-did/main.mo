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
        enrolledEvents : [Nat];  // ✅ Stores event IDs the user is enrolled in
    };

    type TransferEvent = {
        from : Principal;
        to : Principal;
        tokenId : Nat;
    };

    type Review = {
        userId : Principal;
        text : Text;
    };

    type Event = {
        eventId : Nat;
        creator : Principal;
        title : Text;
        description : Text;
        date : Text;
        prize : Nat; // ✅ Added Prize (CBT Token)
        usersEnrolled : [Principal] = [];// ✅ List of user IDs who enrolled
        reviews : [Review];
    };

    stable var nftCounter : Nat = 0;
    stable var eventCounter : Nat = 0;

    stable var tokensEntries : [(Nat, Principal)] = [];
    stable var ownersEntries : [(Principal, [Nat])] = [ ]; // Correct syntax
    stable var metadataEntries : [(Nat, Metadata)] = [];
    stable var usersEntries : [(Principal, User)] = [];
    stable var transferEventsEntries : [TransferEvent] = [];
    stable var eventsEntries : [(Nat, Event)] = [];

    var tokens = HashMap.HashMap<Nat, Principal>(10, Nat.equal, Hash.hash);
    var owners = HashMap.HashMap<Principal, [Nat]](10, Principal.equal, Principal.hash);
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

    // ✅ Register User
    public shared func register(
        user: Principal,
        name: Text, email: Text, gender: Text,
        mobile: Text, dob: Text, address: Text
    ) : async Result.Result<(), Text> {
        if (users.get(user) != null) {
            return #err("User already registered.");
        };
        users.put(user, { name; email; gender; mobile; dob; address; enrolledEvents = [] });
        #ok(());
    };

    public query func getUser(principal: Principal) : async ?User {
        users.get(principal);
    };

    // ✅ Create an Event
    public shared func createEvent (
        user: Principal, 
        title: Text, 
        description: Text, 
        date: Text,
        prize: Nat
    ) : async Result.Result<Nat, Text> {
        if (users.get(user) == null) {
            return #err("User not registered.");
        };

        let eventId = eventCounter;
        eventCounter += 1;

        let newEvent: Event = {
            eventId = eventId;
            creator = user;
            title = title;
            description = description;
            date = date;
            prize = prize;
            usersEnrolled = [];
            reviews = [];
        };

        events.put(eventId, newEvent);
        #ok(eventId);
    };

    // ✅ Enroll in an Event
    public shared func enrollEvent(user: Principal, eventId: Nat) : async Result.Result<(), Text> {
        if (users.get(user) == null) {
            return #err("User not registered.");
        };

        switch (events.get(eventId)) {
            case (?event) {
                // ✅ Prevent duplicate enrollment
                if (Array.find<Principal>(event.usersEnrolled, func(u) { u == user }) != null) {
                    return #err("User already enrolled in this event.");
                };

                let updatedEvent = {
                    event with usersEnrolled = Array.append(event.usersEnrolled, [user]);
                };
                events.put(eventId, updatedEvent);

                // ✅ Add event ID to user's enrolled events
                let userData = switch (users.get(user)) {
                    case (?data) data;
                    case null return #err("User not found.");
                };
                let updatedUser = {
                    userData with enrolledEvents = Array.append(userData.enrolledEvents, [eventId]);
                };
                users.put(user, updatedUser);

                #ok(());
            };
            case null {
                return #err("Event not found.");
            };
        };
    };

    // ✅ Get Events Created by a Specific User
    public query func getUserEvents(user: Principal) : async [Event] {
        Iter.toArray(Iter.filter(events.vals(), func(e: Event) : Bool { e.creator == user }));
    };

    // ✅ Get All Events
    public query func getAllEvents() : async [Event] {
        Iter.toArray(events.vals());
    };

    // ✅ Add Review to an Event
    public shared func addReview(user: Principal, eventId: Nat, text: Text) : async Result.Result<(), Text> {
        if (users.get(user) == null) {
            return #err("User not registered.");
        };

        switch (events.get(eventId)) {
            case (?event) {
                let updatedEvent = {
                    event with reviews = Array.append(event.reviews, [{ userId = user; text = text }]);
                };
                events.put(eventId, updatedEvent);
                #ok(());
            };
            case null {
                return #err("Event not found.");
            };
        };
    };

    // ✅ Get All Reviews for an Event
    public query func getEventReviews(eventId: Nat) : async [Review] {
        switch (events.get(eventId)) {
            case (?event) event.reviews;
            case null [];
        };
    };
};
