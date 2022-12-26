import { useState, useEffect, useMemo } from "react";
import type { NextPage } from "next";
import { ConnectWallet, ChainId, useNetwork, useAddress, useContract } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { Proposal } from "@thirdweb-dev/sdk";
import { AddressZero } from "@ethersproject/constants";

const Home: NextPage = () => {
  const address = useAddress();
  console.log("👋Wallet Address: ", address);
  
  const [network, switchNetwork] = useNetwork();

  const editionDrop = useContract("0xf2FF744A826Ea1c33cC5C0Be0e48ca2959493760", "edition-drop").contract;

  const token = useContract("0x0618698652b69adeBAfbaA1dCa4Bfe55BD101D49", "token").contract;

  const vote = useContract("0x38F03A3143041E85E56D2287b5A47Ae20DcD9b06", "vote").contract;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  const [isClaiming, setIsClaiming] = useState(false);

  const [memberTokenAmounts, setMemberTokenAmounts] = useState<any>([]);

  const [memberAddresses, setMemberAddresses] = useState<string[] | undefined>([]);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  
  const [isVoting, setIsVoting] = useState(false);

  const [hasVoted, setHasVoted] = useState(false);

  const shortenAddress = (str: string) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllProposals = async () => {
      try {
        const proposals = await vote!.getAll();
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      } catch (error) {
        console.log("failed to get proposals", error);
      }
    };
    getAllProposals();
  }, [hasClaimedNFT, vote]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    if (!proposals.length) {
      return;
    }

    const checkIfUserHasVoted = async () => {
      try {
        const hasVoted = await vote!.hasVoted(proposals[0].proposalId.toString(), address);
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("🥵 User has already voted");
        } else {
          console.log("🙂 User has not voted yet");
        }
      } catch (error) {
        console.error("Failed to check if wallet has voted", error);
      }
    };
    checkIfUserHasVoted();

  }, [hasClaimedNFT, proposals, address, vote]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllAddresses = async () => {
      try {
        const memberAddresses = await editionDrop?.history.getAllClaimerAddresses(
          0
        );
        setMemberAddresses(memberAddresses);
        console.log("🚀 Members addresses", memberAddresses);
      } catch (error) {
        console.error("failed to get member list", error);
      }
    };
    getAllAddresses();
  }, [hasClaimedNFT, editionDrop?.history]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token?.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log("👜 Amounts", amounts);
      } catch (error) {
        console.error("failed to get member balances", error);
      }
    };
    getAllBalances();
  }, [hasClaimedNFT, token?.history]);

  const memberList = useMemo(() => {
    return memberAddresses?.map((address) => {
      const member = memberTokenAmounts?.find(({ holder }: {holder: string}) => holder === address);

      return {
        address,
        tokenAmount: member?.balance.displayValue || "0",
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    if (!address) {
      return;
    }
    const checkBalance = async () => {
      try {
        const balance = await editionDrop!.balanceOf(address, 0);
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      } catch (error) {
        setHasClaimedNFT(false);
        console.error("Failed to get balance", error);
      }
    };
    checkBalance();
  }, [address, editionDrop]);

  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await editionDrop!.claim("0", 1);
      console.log(
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop!.getAddress()}/0`
      );
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error("Failed to mint NFT", error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (!address) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>
            Welcome to Mosha Game DAO !!
          </h1>
          <div className={styles.connect}>
            <ConnectWallet />
          </div>
        </main>
      </div>
    );
  }
  else if (address && network && network?.data?.chain?.id !== ChainId.Goerli) {
    console.log("wallet address: ", address);
    console.log("network: ", network?.data?.chain?.id);
    
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Goerli に切り替えてください⚠️</h1>
          <p>この dApp は Goerli テストネットのみで動作します。</p>
          <p>ウォレットから接続中のネットワークを切り替えてください。</p>
        </main>
      </div>
    );
  }
  else if (hasClaimedNFT){
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>🍪DAO Member Page</h1>
          <p>Congratulations on being a member</p>
          <div>
            <div>
              <h2>Member List</h2>
              <table className="card">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Token Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {memberList!.map((member) => {
                    return (
                      <tr key={member.address}>
                        <td>{shortenAddress(member.address)}</td>
                        <td>{member.tokenAmount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div>
              <h2>■ Active Proposals</h2>
              <form 
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                setIsVoting(true);

                const votes = proposals.map((proposal) => {
                  const voteResult = {
                    proposalId: proposal.proposalId,
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    ) as HTMLInputElement;

                    if (elem!.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                try {
                  await Promise.all(
                    votes.map(async ({ proposalId, vote: _vote }) => {
                      const proposal = await vote!.get(proposalId);

                      if (proposal.state === 1) {
                        return vote!.vote(proposalId.toString(), _vote);
                      }
                      return;
                    })
                  );
                  try {
                    await Promise.all(
                      votes.map(async ({ proposalId }) => {
                        const proposal = await vote!.get(proposalId);

                        if (proposal.state === 4) {
                          return vote!.execute(proposalId.toString());
                        }
                      })
                    );
                    setHasVoted(true);
                    console.log("successfully voted");
                  } catch (err) {
                    console.error("failed to execute votes", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  setIsVoting(false);
                }
              }}
              >
                {proposals.map((proposal) => (
                  <div key={proposal.proposalId.toString()} className="card">
                    <h5>{proposal.description}</h5>
                    <div>
                      {proposal.votes.map(({ type, label }) => (
                        <div key={type}>
                          <input type="radio"
                            id={proposal.proposalId + "-" + type}
                            name={proposal.proposalId.toString()}
                            value={type}
                            defaultChecked={type === 2} 
                          />
                          <label htmlFor={proposal.proposalId + "-" + type}>
                            {label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <p></p>
                <button disabled={isVoting || hasVoted} type="submit">
                  {isVoting
                    ? "Voting..."
                    : hasVoted
                      ? "You Already Voted"
                      : "Submit Votes"
                  }
                </button>
                <p></p>
                {!hasVoted && (
                  <small>
                    This will trigger multiple transactions that you will need to sign.
                  </small>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }
  else {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>
            Mint your free 🍪DAO Membership NFT
          </h1>
          <button disabled={isClaiming} onClick={mintNft}>
            {isClaiming ? "Minting...": "Mint your nft(FREE)"}
          </button>
        </main>
      </div>
    );
  }
};

export default Home;
