export const idlFactory = ({ IDL }) => {
  // ✅ Generic Result Type for Success/Failure
  const Result = IDL.Variant({
    ok: IDL.Null,  // ✅ Success with no value
    err: IDL.Text, // ✅ Error message
  });

  // ✅ Result Type for Minting NFT (returns token ID or error)
  const ResultNat = IDL.Variant({
    ok: IDL.Nat,  // ✅ Success: NFT Token ID
    err: IDL.Text, // ✅ Error message
  });
  const Event = IDL.Record({
    eventId: IDL.Nat,        // Unique Event ID
    creator: IDL.Principal,  // Event Creator (User Principal)
    title: IDL.Text,         // Event Title
    description: IDL.Text,    // Event Description
    date: IDL.Text,          // Event Date
  });
  // ✅ NFT Metadata Structure
  const Metadata = IDL.Record({
    name: IDL.Text,       // User's Name
    description: IDL.Text, // NFT Description
    image: IDL.Text,       // NFT Image URL
    email: IDL.Text,       // User's Email
    gender: IDL.Text,      // User's Gender
    mobile: IDL.Text,      // User's Mobile Number
    dob: IDL.Text,         // Date of Birth
    address: IDL.Text,     // User's Address
  });

  // ✅ User Profile Structure
  const User = IDL.Record({
    name: IDL.Text,
    email: IDL.Text,
    gender: IDL.Text,
    mobile: IDL.Text,
    dob: IDL.Text,
    address: IDL.Text,
  });

  return IDL.Service({
    // ✅ Register a New User
    "register": IDL.Func(
      [IDL.Principal,IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], // (name, email, gender, mobile, dob, address)
      [Result], // Returns `Result<(), Text>`
      []
    ),

    // ✅ Get Token IDs Owned by a User
    "tokensOfOwner": IDL.Func(
      [IDL.Principal], // Owner Principal
      [IDL.Vec(IDL.Nat)], // Returns Array of Token IDs
      ["query"]
    ),

    // ✅ Get User Profile by Principal
    "getUser": IDL.Func(
      [IDL.Principal], // User Principal
      [IDL.Opt(User)], // Returns Optional User Record
      ["query"]
    ),

    // ✅ Mint an NFT for a Registered User (Now Accepts `user` Parameter)
    "mint": IDL.Func(
      [IDL.Principal, IDL.Text, IDL.Text], // (User Principal, NFT Description, Image URL)
      [ResultNat], // Returns `Result<Nat, Text>` (Token ID or Error)
      []
    ),

    // ✅ Transfer an NFT
    "transfer": IDL.Func(
      [IDL.Principal, IDL.Nat], // (Recipient Principal, Token ID)
      [IDL.Bool], // Returns `true` if successful
      []
    ),

    // ✅ Update NFT Metadata (Now Accepts `user` Parameter)
    "updateMetadata": IDL.Func(
      [
        IDL.Principal, // User Principal
        IDL.Nat, // Token ID
        IDL.Text, // Name
        IDL.Text, // Description
        IDL.Text, // Image
        IDL.Text, // Email
        IDL.Text, // Gender
        IDL.Text, // Mobile
        IDL.Text, // DOB
        IDL.Text, // Address
      ],
      [IDL.Bool], // Returns `true` if metadata updated successfully
      []
    ),

    // ✅ Get NFT Balance of a User
    "balanceOf": IDL.Func(
      [IDL.Principal], // Owner Principal
      [IDL.Nat], // Returns NFT Count
      ["query"]
    ),

    // ✅ Get Owner of a Specific NFT
    "ownerOf": IDL.Func(
      [IDL.Nat], // Token ID
      [IDL.Opt(IDL.Principal)], // Returns Optional Owner Principal
      ["query"]
    ),

    // ✅ Get Total Minted NFTs
    "totalSupply": IDL.Func(
      [], // No Inputs
      [IDL.Nat], // Returns Total NFT Count
      ["query"]
    ),

    // ✅ Get NFT Metadata
    "getMetadata": IDL.Func(
      [IDL.Nat], // Token ID
      [IDL.Opt(Metadata)], // Returns Optional Metadata
      ["query"]
    ),
    "createEvent": IDL.Func(
      [IDL.Principal, IDL.Text, IDL.Text, IDL.Text], // (user, title, description, date)
      [Result], // Returns `Result<Nat, Text>` (Event ID or Error)
      []
    ),

    // ✅ Get All Events
    "getAllEvents": IDL.Func(
      [], // No input
      [IDL.Vec(Event)], // Returns a list of events
      ["query"]
    ),
  });
};
