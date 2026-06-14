"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../../../contexts/LanguageContext';
import { translations } from '../../../translations/translations';
import { supabase } from '../../../supabaseClient';
import './NewsArticle.css';

const NewsArticle = () => {
  const { id } = useParams();
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]);

  // Article data based on ID
  const getStaticArticleData = () => {
    const articleId = parseInt(id);
    
    if (articleId === 9) {
      return {
        id: articleId,
        title: 'Meet Tactical - Inside the Mind of the Champion',
        category: t.playerProfiles || 'Player Profile',
        author: t.syncplayTeam,
        date: 'December 22, 2025',
        image: '/tournament-media/photos/winners ss.png',
        content: `
          <p>At the inaugural syncplay eSports 2v2 Tournament, one name stood out during the knockout phase: <strong>Tactical</strong>. Playing for Team Century alongside his teammate Rhymez, Tactical showcased exceptional decision-making, relentless attacks, and calm composure under pressure.</p>
          
          <h3>The Road to the Championship</h3>
          <p>Team Century's path was not easy. Placed in a tough Group C, they had to battle against formidable teams like L'Flames and Temple Boys. While they suffered a few challenges in the group stages, Tactical’s play stepped up significantly in the knockouts.</p>
          <p>In the Quarterfinals, Century dominated Prime Time with a 4-0 clean sheet. The Semifinals saw a tighter 3-2 victory against the skilled y.fola team, leading to a blockbuster final against Orbyters. In the final, Tactical scored two critical goals to secure a 3-2 win and lift the trophy.</p>
          
          <h3>Tactics and Gaming Style</h3>
          <p>Tactical is known for his fast build-up and high passing accuracy. Scaling with an overall rating of 93 in the syncplay database, his stats (94 Attack, 91 Passing, 92 Clutch) reflect his ability to perform when it matters most.</p>
          <p>"We trained for weeks on coordination," Tactical said in a post-match interview. "In 2v2, you must trust your partner completely. Rhymez held the defense, which gave me the space to create attacks."</p>
          
          <p>Browse <a href="/players/Tactical" style="color: #E63946; font-weight: bold; text-decoration: none;">Tactical's player profile page</a> to view his full attributes breakdown and tournament matches history!</p>
        `
      };
    } else if (articleId === 10) {
      return {
        id: articleId,
        title: 'Meet Baji-jr - The Rise of the Runner-Up',
        category: t.playerProfiles || 'Player Profile',
        author: t.syncplayTeam,
        date: 'December 23, 2025',
        image: '/tournament-media/photos/welcome baji jr.png',
        content: `
          <p>While Team Century took home the trophy, the story of the inaugural tournament wouldn't be complete without highlighting the phenomenal run of <strong>Baji-jr</strong> and Team Orbyters. Alongside his teammate Anife, Baji-jr showcased elite gameplay that carried them all the way to the Grand Final.</p>
          
          <h3>The Tournament Run</h3>
          <p>Orbyters' campaign started with a setback in Group B, suffering a tight <strong>1-0 defeat</strong> against y.fola. However, they quickly bounced back in style, dominating Get Psyched with a <strong>4-0 shutout</strong> and outclassing Banters FC in a high-scoring <strong>5-2 victory</strong> to advance to the knockouts.</p>
          
          <p>In the Quarterfinals, Orbyters kept their momentum going by cruising past Temple Boys with another <strong>4-0 clean sheet</strong>. The Semifinals served up the tournament's most dramatic fixture: a <strong>3-3 thriller</strong> against Gameverse. With neither side able to find a winner in open play, Baji-jr and Anife kept their nerve to win the penalty shootout and book a spot in the Grand Final.</p>
          
          <p>The Grand Final was a highly competitive matchup against Team Century. Despite a spirited performance, Orbyters ultimately fell <strong>3-2</strong>, finishing as the proud runner-up of the tournament.</p>
          
          <h3>Player Attributes & Ratings</h3>
          <p>In the syncplay esports database, Baji-jr is rated at a strong <strong>78 OVR</strong>. His stats reflect a dangerous attacking force and a reliable clutch performer: <strong>87 Attack</strong>, <strong>73 Defense</strong>, <strong>78 Passing</strong>, <strong>70 Consistency</strong>, and a remarkable <strong>84 Clutch</strong> rating.</p>
          
          <p>Browse <a href="/players/Baji-jr" style="color: #E63946; font-weight: bold; text-decoration: none;">Baji-jr's player profile page</a> to view his full attributes breakdown and detailed match history!</p>
        `
      };
    } else if (articleId === 7) {
      return {
        id: articleId,
        title: t.tournamentChampionsCrowned || 'Tournament Champions Crowned - Full Results & Highlights',
        category: t.tournamentResults,
        author: t.syncplayTeam,
        date: 'December 20, 2025',
        image: '/tournament-media/photos/winners ss.png',
        content: `
          <p>Our inaugural 2v2 EA Sports FC 26 Tournament has been completed successfully! After intense competition, we're proud to announce our champions.</p>
          
          <h3>Final Standings</h3>
          <p><strong>1st Place:</strong> ${t.winnerTeamName || 'Champions'} - ${t.winnerPrize || '₦800,000'}</p>
          <p><strong>2nd Place:</strong> ${t.runnerUpTeamName || 'Runner-Up'} - ${t.runnerUpPrize || '₦400,000'}</p>
          <p><strong>3rd Place:</strong> ${t.thirdPlaceTeamName || 'Third Place'} - ${t.thirdPlacePrize || '₦300,000'}</p>
          
          <h3>Tournament Highlights</h3>
          <p>The tournament featured 12 teams competing in a group stage format, followed by knockout rounds. The competition was fierce, with many close matches and incredible displays of skill.</p>
          
          <p>Thank you to all participants and supporters for making this inaugural tournament a success!</p>
          
          <div style="margin: 2rem 0; text-align: center;">
            <a href="/tournament-results" style="display: inline-block; padding: 1rem 2rem; background: #E63946; color: white; text-decoration: none; border-radius: 5px; margin: 0.5rem;">
              View Full Results
            </a>
            <a href="/gallery" style="display: inline-block; padding: 1rem 2rem; background: #333; color: white; text-decoration: none; border-radius: 5px; margin: 0.5rem;">
              View Gallery
            </a>
            <a href="/videos" style="display: inline-block; padding: 1rem 2rem; background: #333; color: white; text-decoration: none; border-radius: 5px; margin: 0.5rem;">
              Watch Videos
            </a>
          </div>
        `
      };
    } else if (articleId === 8) {
      return {
        id: articleId,
        title: t.tournamentHighlightsArticle || 'Tournament Highlights & Best Moments',
        category: t.tournamentResults,
        author: t.syncplayTeam,
        date: 'December 21, 2025',
        image: '/tournament-media/photos/IMG_4596.JPEG',
        content: `
          <p>Relive the most exciting moments from our inaugural tournament! From incredible goals to nail-biting finishes, the tournament delivered non-stop action.</p>
          
          <h3>Best Moments</h3>
          <ul>
            <li>Incredible team coordination displays</li>
            <li>Last-minute winning goals</li>
            <li>Outstanding defensive plays</li>
            <li>Championship celebration</li>
          </ul>
          
          <h3>Player Interviews</h3>
          <p>Watch exclusive interviews with tournament participants, including pre-event predictions, post-match reactions, and winner celebrations.</p>
          
          <p>Check out our <a href="/videos">Videos page</a> for full match highlights and player interviews!</p>
        `
      };
    } else if (articleId === 1) {
      return {
        id: articleId,
        title: t.newsArticle1Title,
        category: t.announcements,
        author: t.syncplayTeam,
        date: 'October 23, 2025',
        image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
        content: `
          <p>syncplay eSports has officially launched! Our inaugural 2v2 tournament on December 20, 2025 was a massive success, bringing together the region's top eFootball talent. The event showcased high-level team coordination, strategic depth, and intense matches.</p>
          <p>We want to thank all of our competing teams and spectators for their support during this historic launch. Stay tuned as we build the premier esports platform in Nigeria!</p>
        `
      };
    } else if (articleId === 2) {
      return {
        id: articleId,
        title: t.newsArticle2Title,
        category: t.announcements,
        author: t.syncplayTeam,
        date: 'October 23, 2025',
        image: '/fc-26-1024x639.jpg',
        content: `
          <p>Our registration window for the inaugural 2v2 tournament was completed successfully, with 12 elite teams securing their spots to compete. Teams went head-to-head for recognition and exclusive prizes in the tournament.</p>
          <p>For future events, keep an eye on our Events page and make sure to register early, as team slots are limited and fill up very quickly!</p>
        `
      };
    } else if (articleId === 3) {
      return {
        id: articleId,
        title: t.newsArticle3Title,
        category: t.announcements,
        author: t.syncplayTeam,
        date: 'October 22, 2025',
        image: '/1acc9234056000389336228dc9f195d0570f25a5.png',
        content: `
          <p>syncplay eSports is Nigeria's newest dedicated platform for competitive sports simulation gaming. Focused on bringing gamers together, we organize professional-grade tournaments for eFootball and eBasketball.</p>
          <p>By partnering with industry experts, experienced organizers, and talented broadcasters, syncplay is set to become your ultimate destination for high-quality esports content and competitive tournaments. Join us on this journey!</p>
        `
      };
    } else if (articleId === 4) {
      return {
        id: articleId,
        title: t.newsArticle4Title,
        category: t.announcements,
        author: t.syncplayTeam,
        date: 'October 22, 2025',
        image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
        content: `
          <p>To ensure fair play and professional standards, the syncplay eSports committee has officially published the Tournament Rules and Regulations. All participating teams and players must review these guidelines before competing.</p>
          <p>The rules cover game settings (half length, difficulty, controller settings), match reporting, disconnection handling, and our code of conduct. Check our Tournaments page for the complete rulebook.</p>
        `
      };
    } else if (articleId === 5) {
      return {
        id: articleId,
        title: t.newsArticle5Title,
        category: t.announcements,
        author: t.syncplayTeam,
        date: 'October 21, 2025',
        image: '/49f5b4f9bcc62ca23349c7f4096a7d52b91a7a3f.jpg',
        content: `
          <p>Following our successful December 2025 launch, syncplay is gearing up for a packed schedule of competitive gaming. We are expanding our tournament offerings to include regular Weekend Cups and Championship Series.</p>
          <p>Whether you are a casual gamer looking for fun or a professional player aiming for the top, there will be plenty of opportunities to showcase your skills and win cash prizes.</p>
        `
      };
    } else if (articleId === 6) {
      return {
        id: articleId,
        title: t.newsArticle6Title,
        category: t.announcements,
        author: t.syncplayTeam,
        date: 'October 20, 2025',
        image: '/fc-26-1024x639.jpg',
        content: `
          <p>Following overwhelming feedback and requests from the Nigerian gaming community, syncplay is excited to announce that eBasketball tournaments will be joining our lineup soon!</p>
          <p>We are currently working with esports organizers to finalize rules, structure, and schedules for the upcoming basketball events. Stay tuned to our announcements and follow us on social media for updates.</p>
        `
      };
    } else {
      return {
        id: articleId,
        title: t.newsArticleTitle,
        category: t.tournamentAnnouncement,
        author: t.syncplayTeam,
        date: 'October 23, 2025',
        image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
        content: t.newsArticleContent
      };
    }
  };

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        // If ID is not a small integer, try loading from Supabase
        const isNumeric = /^\d+$/.test(id);
        if (!isNumeric && id) {
          const { data, error } = await supabase
            .from('news')
            .select('*')
            .eq('id', id)
            .single();

          if (!error && data) {
            setArticle({
              id: data.id,
              title: data.title,
              category: data.category,
              author: data.author,
              date: new Date(data.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
              image: data.image_url,
              content: data.content
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load from DB, falling back:', err);
      }

      // Fallback
      setArticle(getStaticArticleData());
      setLoading(false);
    };

    const fetchRelated = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('news')
            .select('id, title, image_url')
            .eq('published', true)
            .neq('id', id)
            .limit(3);
          
          if (!error && data && data.length > 0) {
            setRelatedArticles(data.map(art => ({
              id: art.id,
              title: art.title,
              image: art.image_url
            })));
          } else {
            // Default static fallbacks
            setRelatedArticles([
              {
                id: 7,
                title: t.tournamentChampionsCrowned || 'Tournament Champions Crowned',
                image: '/tournament-media/photos/winners ss.png'
              },
              {
                id: 8,
                title: t.tournamentHighlightsArticle || 'Tournament Highlights',
                image: '/tournament-media/photos/IMG_4596.JPEG'
              },
              {
                id: 1,
                title: t.newsArticle1Title,
                image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg'
              }
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load related news:', err);
      }
    };

    fetchArticle();
    fetchRelated();
  }, [id, currentLanguage]);

  if (loading) {
    return (
      <div className="article-page" style={{ paddingTop: '100px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#888' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#E63946' }}></i>
          <p>Loading article details...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-page" style={{ paddingTop: '100px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: '3rem', color: '#E63946', marginBottom: '1rem' }}></i>
          <h2>Article Not Found</h2>
          <p style={{ margin: '1rem 0 2rem' }}>The article you are looking for does not exist or has been removed.</p>
          <Link href="/news" className="btn btn-primary">Back to News</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      {/* Article Header */}
      <section className="article-header">
        <div className="article-header-overlay"></div>
        <div className="container">
          <div className="article-breadcrumb">
            <Link href="/news">{t.news}</Link>
            <i className="fas fa-chevron-right"></i>
            <span>{article.category}</span>
          </div>
          <h1>{article.title}</h1>
          <div className="article-meta">
            <span className="meta-item">
              <i className="fas fa-folder"></i> {article.category}
            </span>
            <span className="meta-item">
              <i className="fas fa-calendar"></i> {article.date}
            </span>
            <span className="meta-item">
              <i className="fas fa-user"></i> {article.author}
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="article-content">
        <div className="container">
          <div className="article-wrapper">
            <div className="article-main">
              <div className="article-image">
                <img src={article.image} alt={article.title} />
              </div>
              
              <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />

              <div className="article-share">
                <h4>{t.shareArticle}</h4>
                <div className="share-buttons">
                  <button className="share-btn twitter">
                    <i className="fab fa-twitter"></i>
                  </button>
                  <button className="share-btn linkedin">
                    <i className="fab fa-linkedin"></i>
                  </button>
                  <button className="share-btn link">
                    <i className="fas fa-link"></i>
                  </button>
                </div>
              </div>

              <div className="article-navigation">
                <Link href="/news" className="btn btn-secondary">
                  <i className="fas fa-arrow-left"></i> {t.backToNews}
                </Link>
              </div>
            </div>

            <aside className="article-sidebar">
              <div className="sidebar-widget">
                <h3>{t.relatedArticles}</h3>
                <div className="related-articles">
                  {relatedArticles.map(related => (
                    <Link key={related.id} href={`/news/${related.id}`} className="related-card">
                      <img src={related.image} alt={related.title} />
                      <h4>{related.title}</h4>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="sidebar-widget cta-widget">
                {parseInt(id) === 7 || parseInt(id) === 8 ? (
                  <>
                    <i className="fas fa-trophy"></i>
                    <h3>{t.tournamentResults}</h3>
                    <p>{t.tournamentResultsDesc}</p>
                    <Link href="/tournament-results" className="btn btn-primary">
                      {t.viewResults}
                    </Link>
                  </>
                ) : (
                  <>
                    <i className="fas fa-trophy"></i>
                    <h3>{t.joinATournament}</h3>
                    <p>{t.joinTournamentDesc}</p>
                    <Link href="/tournaments" className="btn btn-primary">
                      {t.viewTournaments}
                    </Link>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsArticle;
