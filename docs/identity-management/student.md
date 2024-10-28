# Student Identity Management

![](protocol.png "Protocol Visualization")

We consider the collimator server to be honest but curious, i.e. the server will follow the protocols but may store additional information.

Each student will be assigned a long-lived pseudonym that allows the correlation of activity across sessions.
There is the requirement that teachers need to see who their students are in class meaning a teacher must be able to associate a student's identity with their pseudonym used by the system.
To this end, we employ encryption where the pseudonym of a student is determined by encrypting the student's identifier.
In particular, each teacher $T$ will generate a long-term public/private key pair $(\mathrm{pk}_{T}, \mathrm{sk}_{T})$ where the public key $\mathrm{pk}_{T}$ is stored by the server directly and the private (or secret) key $\mathrm{sk}_{T}$ is stored on the server only *after* the teacher's machine encrypted it locally using a symmetric key $k_{p}$ derived from a password $p$.

When a student $S$ wants to join a session $j$, they click on the link they receive from their teacher.
This link contains a fingerprint (SHA-512 hash) of the teacher's public key allowing the student's machine to authenticate the teacher's public key.
Using the fingerprint, the student's machine can retrieve the public key from the server and verify its fingerprint.
Note that, assuming the link is distributed via a trusted, authenticated channel, (blackboard, teams, ...) the server does not get the chance to manipulate the link and therefore cannot send a different key to the student without them noticing after verifying the fingerprint.

In order to authenticate, student $S$ then performs the OpenId Connect flow with some provider where the application is a public client meaning the server is not involved in the protocol.
After receiving an id token containing the identifier $\mathrm{id}_{S}$, the student's machine generates a session-specific ephemeral keypair $(\mathrm{pk}_{S,j}, \mathrm{sk}_{S,j})$ and performs a Diffie-Hellman key exchange with the teacher.
Since student $S$ already knows $\mathrm{pk}_{T}$, it can already derive the shared symmetric ephemeral secret $s_{T,S,j}$ and send both, the public key $\mathrm{pk}_{S,j}$ required for the Diffie-Hellman key exchange and the identity $\mathrm{id}_{S}$ encrypted under the ephemeral shared secret $s_{T,S,j}$, i.e. $\{\mathrm{id}_{S}\}_{s_{T,S,j}}$, to the teacher. 

Note, that this message does not contain any confidential information and the server can therfore be relied upon for forwarding the message.
An impersonation of a student is not feasible for the server as it would require the server to forge a valid id token which we assume it cannot (i.e. we hope for the student to protect their authentication methods at the OpenId Connect provider).

After $T$ receives $\mathrm{pk}_{S,j}$ and $\{\mathrm{id}_{S}\}_{s_{T,S,j}}$, they can derive $s_{T,S,j}$ from $\mathrm{pk}_{S,j}$ and $\mathrm{sk}_{T}$.
This in turn enables $T$ to decrypt the identity and check the validity of the OpenId Connect token.
Note that this step is mandatory, as otherwise the server could impersonate any student.

After doing so $T$ determines some pseudonym $\mathrm{id}_{S'}$ for $S$ and requests an authentication token from the server.
Once the server issues an authentication token $t_{S'}$, $T$ sends the authentication token $t_{S'}$ to the student encrypted under the ephemeral key $s_{T,S,j}$, i.e. $\{t_{S'}\}_{s_{T,S,j}}$.

Finally, $S$ decrypts the authentication token $t_{S'}$ for its pseudonym $S'$ and can start communicating with the server.

Note that it is advisable to introduce random delays or shuffling of the order of messages to prevent the server from correlating different requests and deducing a student's identity, especially if the server is used for proxying the messages.

By generating an ephemeral key for communication, the student gets the guarantee for perfect forward secrecy with respect to the exchanged messages.
Note that the teacher does not get this guarantee as it does not generate an ephemeral key (this is different from TLS); although in reality since students have an interest in PFS, they will generate an ephemeral key resulting in PFS for both parties.
