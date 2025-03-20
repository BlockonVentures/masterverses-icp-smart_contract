export const idlFactory = ({ IDL }) => {
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Event = IDL.Record({
    'eventId' : IDL.Nat,
    'title' : IDL.Text,
    'creator' : IDL.Principal,
    'date' : IDL.Text,
    'description' : IDL.Text,
  });
  const User = IDL.Record({
    'dob' : IDL.Text,
    'name' : IDL.Text,
    'email' : IDL.Text,
    'address' : IDL.Text,
    'gender' : IDL.Text,
    'mobile' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  return IDL.Service({
    'createEvent' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Text, IDL.Text],
        [Result_1],
        [],
      ),
    'getAllEvents' : IDL.Func([], [IDL.Vec(Event)], ['query']),
    'getUser' : IDL.Func([IDL.Principal], [IDL.Opt(User)], ['query']),
    'getUserEvents' : IDL.Func([IDL.Principal], [IDL.Vec(Event)], ['query']),
    'mint' : IDL.Func([IDL.Principal, IDL.Text, IDL.Text], [Result_1], []),
    'register' : IDL.Func(
        [
          IDL.Principal,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
        ],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
