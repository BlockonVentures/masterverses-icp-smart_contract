export const idlFactory = ({ IDL }) => {
  const Metadata = IDL.Record({
    'dob' : IDL.Text,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'email' : IDL.Text,
    'address' : IDL.Text,
    'gender' : IDL.Text,
    'image' : IDL.Text,
    'mobile' : IDL.Text,
  });
  const User = IDL.Record({
    'dob' : IDL.Text,
    'name' : IDL.Text,
    'email' : IDL.Text,
    'address' : IDL.Text,
    'gender' : IDL.Text,
    'mobile' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  return IDL.Service({
    'balanceOf' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getMetadata' : IDL.Func([IDL.Nat], [IDL.Opt(Metadata)], ['query']),
    'getUser' : IDL.Func([IDL.Principal], [IDL.Opt(User)], ['query']),
    'mint' : IDL.Func([IDL.Principal, IDL.Text, IDL.Text], [Result_1], []),
    'ownerOf' : IDL.Func([IDL.Nat], [IDL.Opt(IDL.Principal)], ['query']),
    'register' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'tokensOfOwner' : IDL.Func([IDL.Principal], [IDL.Vec(IDL.Nat)], ['query']),
    'totalSupply' : IDL.Func([], [IDL.Nat], ['query']),
    'transfer' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Bool], []),
    'updateMetadata' : IDL.Func(
        [
          IDL.Principal,
          IDL.Nat,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
        ],
        [IDL.Bool],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
