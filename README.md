# KAMUN Event Suite 🎙️📊

**A high-performance, local-first management system built for the Krishnagar Academy Model United Nations (KAMUN).**

## 💡 The Problem
Existing cloud-based MUN software often suffers from interface lag and lacks visual polish. For KAMUN, we needed a solution that could:
1. Handle real-time voting without delay.
2. Project "television-grade" dynamic graphics for the live audience.
3. Run flawlessly during the event with immediate responsiveness.

## 🚀 The Solution
I built a custom software suite using **Vite** for lightning-fast frontend performance and **Supabase** to handle real-time data synchronization. The application was hosted on **localhost** during the event to ensure zero latency for the broadcast overlays.

## ✨ Key Features
* **Zero-Latency Voting:** Instant vote tallying and result projection enabled by Supabase Realtime.
* **Broadcast Overlays:** Dynamic lower-thirds and motion graphics for the main stage projector.
* **Session Management:** Real-time synchronization of timers and agenda lists.
* **Admin Dashboard:** Central control panel for the Chair/Executive Board.

## 🛠️ Tech Stack
* **Frontend:** React (via Vite) - Chosen for sub-millisecond HMR and optimized build size.
* **Backend/Database:** Supabase - Used for authentication and real-time database subscriptions.


## 🏃‍♂️ How to Run
1. Clone the repo:
   ```bash
   git clone https://github.com/Subha2009/kamun-software.git
