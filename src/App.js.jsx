/* eslint-disable */
"use client";
// ╔══════════════════════════════════════════════════════════════╗
// ║        CookMate AI v5.0 — Full Production App               ║
// ║  Supabase DB-first + Claude Vision + Groq Chatbot           ║
// ╚══════════════════════════════════════════════════════════════╝
 import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || "",
  process.env.REACT_APP_SUPABASE_KEY || ""
);
const CFG = {
  CLAUDE_MODEL: "claude-sonnet-4-20250514",
  GROQ_MODEL:   "llama-3.3-70b-versatile",
  ANTHROPIC_KEY: process.env.REACT_APP_ANTHROPIC_KEY || "",
  GROQ_KEY:      process.env.REACT_APP_GROQ_KEY || "",
  SUPABASE_URL:  process.env.REACT_APP_SUPABASE_URL || "",
  SUPABASE_KEY:  process.env.REACT_APP_SUPABASE_KEY || "",
  YOUTUBE_KEY:   process.env.REACT_APP_YOUTUBE_KEY || "",
};

// ── INDIA STATES DATA ─────────────────────────────────────────
const INDIA_STATES = [
  { state:"Andhra Pradesh", emoji:"🌶️", color:"#FF6B35", dishes:[
    {name:"Pesarattu",emoji:"🥞",time:"20 min",diff:"Easy",cal:180,protein:"8g",tags:["Breakfast"]},
    {name:"Gongura Mutton",emoji:"🍖",time:"60 min",diff:"Hard",cal:520,protein:"38g",tags:["Lunch"]},
    {name:"Pulihora",emoji:"🍚",time:"30 min",diff:"Medium",cal:280,protein:"6g",tags:["Lunch"]},
    {name:"Gutti Vankaya",emoji:"🍆",time:"40 min",diff:"Medium",cal:220,protein:"5g",tags:["Dinner"]},
    {name:"Hyderabadi Biryani",emoji:"🍛",time:"90 min",diff:"Hard",cal:580,protein:"32g",tags:["Dinner"]},
  ]},
  { state:"Punjab", emoji:"🌾", color:"#FF9800", dishes:[
    {name:"Butter Chicken",emoji:"🍗",time:"60 min",diff:"Medium",cal:520,protein:"36g",tags:["Dinner"]},
    {name:"Dal Makhani",emoji:"🫘",time:"90 min",diff:"Medium",cal:380,protein:"16g",tags:["Dinner"]},
    {name:"Sarson Ka Saag",emoji:"🟢",time:"60 min",diff:"Medium",cal:290,protein:"10g",tags:["Lunch"]},
    {name:"Amritsari Kulcha",emoji:"🫓",time:"45 min",diff:"Hard",cal:420,protein:"11g",tags:["Breakfast"]},
    {name:"Lassi",emoji:"🥛",time:"5 min",diff:"Easy",cal:180,protein:"7g",tags:["Drink"]},
    {name:"Rajma Chawal",emoji:"🫘",time:"45 min",diff:"Easy",cal:420,protein:"18g",tags:["Lunch"]},
  ]},
  { state:"Maharashtra", emoji:"🌊", color:"#E74C3C", dishes:[
    {name:"Vada Pav",emoji:"🥙",time:"30 min",diff:"Easy",cal:380,protein:"9g",tags:["Snacks"]},
    {name:"Misal Pav",emoji:"🥘",time:"40 min",diff:"Medium",cal:420,protein:"16g",tags:["Breakfast"]},
    {name:"Puran Poli",emoji:"🥞",time:"60 min",diff:"Hard",cal:340,protein:"8g",tags:["Dessert"]},
    {name:"Kolhapuri Chicken",emoji:"🍗",time:"60 min",diff:"Hard",cal:520,protein:"36g",tags:["Dinner"]},
    {name:"Sabudana Khichdi",emoji:"🫙",time:"25 min",diff:"Easy",cal:310,protein:"6g",tags:["Breakfast"]},
  ]},
  { state:"Gujarat", emoji:"🌻", color:"#F1C40F", dishes:[
    {name:"Dhokla",emoji:"🟡",time:"30 min",diff:"Easy",cal:160,protein:"7g",tags:["Breakfast"]},
    {name:"Thepla",emoji:"🫓",time:"25 min",diff:"Easy",cal:220,protein:"6g",tags:["Breakfast"]},
    {name:"Undhiyu",emoji:"🥘",time:"90 min",diff:"Hard",cal:380,protein:"12g",tags:["Dinner"]},
    {name:"Khandvi",emoji:"🟡",time:"20 min",diff:"Medium",cal:140,protein:"6g",tags:["Snacks"]},
  ]},
  { state:"Tamil Nadu", emoji:"🌺", color:"#9C27B0", dishes:[
    {name:"Masala Dosa",emoji:"🫓",time:"30 min",diff:"Medium",cal:340,protein:"8g",tags:["Breakfast"]},
    {name:"Chettinad Chicken",emoji:"🍗",time:"75 min",diff:"Hard",cal:520,protein:"38g",tags:["Dinner"]},
    {name:"Pongal",emoji:"🍚",time:"30 min",diff:"Easy",cal:320,protein:"9g",tags:["Breakfast"]},
    {name:"Rasam",emoji:"🫙",time:"20 min",diff:"Easy",cal:80,protein:"3g",tags:["Lunch"]},
    {name:"Sambar",emoji:"🫕",time:"35 min",diff:"Medium",cal:180,protein:"8g",tags:["Lunch"]},
  ]},
  { state:"Kerala", emoji:"🥥", color:"#27AE60", dishes:[
    {name:"Appam with Stew",emoji:"🥞",time:"40 min",diff:"Medium",cal:340,protein:"12g",tags:["Breakfast"]},
    {name:"Kerala Fish Curry",emoji:"🐟",time:"45 min",diff:"Medium",cal:380,protein:"28g",tags:["Lunch"]},
    {name:"Puttu Kadala",emoji:"🫙",time:"30 min",diff:"Easy",cal:310,protein:"11g",tags:["Breakfast"]},
    {name:"Payasam",emoji:"🍮",time:"35 min",diff:"Easy",cal:290,protein:"6g",tags:["Dessert"]},
  ]},
  { state:"West Bengal", emoji:"🐟", color:"#2196F3", dishes:[
    {name:"Macher Jhol",emoji:"🐟",time:"40 min",diff:"Medium",cal:320,protein:"26g",tags:["Lunch"]},
    {name:"Kosha Mangsho",emoji:"🐑",time:"90 min",diff:"Hard",cal:520,protein:"36g",tags:["Dinner"]},
    {name:"Mishti Doi",emoji:"🍮",time:"20 min",diff:"Easy",cal:190,protein:"8g",tags:["Dessert"]},
    {name:"Rasgulla",emoji:"⚪",time:"45 min",diff:"Hard",cal:180,protein:"5g",tags:["Dessert"]},
  ]},
  { state:"Rajasthan", emoji:"🏜️", color:"#FF6B35", dishes:[
    {name:"Dal Baati Churma",emoji:"🍲",time:"90 min",diff:"Hard",cal:620,protein:"18g",tags:["Lunch"]},
    {name:"Laal Maas",emoji:"🐑",time:"75 min",diff:"Hard",cal:540,protein:"38g",tags:["Dinner"]},
    {name:"Gatte ki Sabzi",emoji:"🟡",time:"40 min",diff:"Medium",cal:310,protein:"10g",tags:["Lunch"]},
  ]},
  { state:"Karnataka", emoji:"🌴", color:"#E74C3C", dishes:[
    {name:"Bisi Bele Bath",emoji:"🍲",time:"45 min",diff:"Medium",cal:380,protein:"14g",tags:["Lunch"]},
    {name:"Ragi Mudde",emoji:"🟤",time:"20 min",diff:"Easy",cal:290,protein:"8g",tags:["Dinner"]},
    {name:"Mysore Masala Dosa",emoji:"🫓",time:"30 min",diff:"Medium",cal:320,protein:"9g",tags:["Breakfast"]},
  ]},
  { state:"Uttar Pradesh", emoji:"🕌", color:"#673AB7", dishes:[
    {name:"Lucknowi Biryani",emoji:"🍚",time:"120 min",diff:"Hard",cal:560,protein:"26g",tags:["Lunch"]},
    {name:"Tunday Kebab",emoji:"🥩",time:"60 min",diff:"Hard",cal:380,protein:"28g",tags:["Dinner"]},
    {name:"Bedai Jalebi",emoji:"🍩",time:"45 min",diff:"Hard",cal:420,protein:"8g",tags:["Breakfast"]},
  ]},
  { state:"Goa", emoji:"🏖️", color:"#E74C3C", dishes:[
    {name:"Fish Curry Rice",emoji:"🐟",time:"45 min",diff:"Medium",cal:420,protein:"28g",tags:["Lunch"]},
    {name:"Prawn Balchão",emoji:"🦐",time:"60 min",diff:"Hard",cal:380,protein:"30g",tags:["Dinner"]},
    {name:"Bebinca",emoji:"🍮",time:"90 min",diff:"Hard",cal:320,protein:"6g",tags:["Dessert"]},
  ]},
  { state:"Himachal Pradesh", emoji:"⛰️", color:"#1ABC9C", dishes:[
    {name:"Chha Gosht",emoji:"🐑",time:"90 min",diff:"Hard",cal:480,protein:"36g",tags:["Dinner"]},
    {name:"Sidu",emoji:"🫓",time:"60 min",diff:"Medium",cal:290,protein:"9g",tags:["Breakfast"]},
    {name:"Aktori",emoji:"🥞",time:"30 min",diff:"Easy",cal:220,protein:"6g",tags:["Breakfast"]},
  ]},
  {
    state: "Bihar",
    emoji: "🌾",
    color: "#F39C12",
    dishes: [
      {
        name: "Litti Chokha",
        emoji: "🍚",
        time: "60 min",
        diff: "Medium",
        cal: 420,
        protein: "14g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Dal Pitha",
        emoji: "🥘",
        time: "45 min",
        diff: "Medium",
        cal: 280,
        protein: "10g",
        tags: [
          "Breakfast"
        ]
      },
      {
        name: "Thekua",
        emoji: "🍮",
        time: "30 min",
        diff: "Easy",
        cal: 320,
        protein: "6g",
        tags: [
          "Snacks"
        ]
      },
      {
        name: "Sattu Paratha",
        emoji: "🫓",
        time: "25 min",
        diff: "Easy",
        cal: 380,
        protein: "16g",
        tags: [
          "Breakfast"
        ]
      },
      {
        name: "Chura Dahi",
        emoji: "🥣",
        time: "10 min",
        diff: "Easy",
        cal: 220,
        protein: "8g",
        tags: [
          "Breakfast"
        ]
      },
      {
        name: "Mutton Curry Bihari Style",
        emoji: "🍖",
        time: "70 min",
        diff: "Hard",
        cal: 480,
        protein: "28g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Malpua",
        emoji: "🥞",
        time: "25 min",
        diff: "Easy",
        cal: 340,
        protein: "7g",
        tags: [
          "Dessert",
          "Snacks"
        ]
      },
      {
        name: "Kadhi Bari",
        emoji: "🍲",
        time: "40 min",
        diff: "Medium",
        cal: 260,
        protein: "9g",
        tags: [
          "Lunch"
        ]
      },
      {
        name: "Aloo Chokha",
        emoji: "🥔",
        time: "20 min",
        diff: "Easy",
        cal: 180,
        protein: "4g",
        tags: [
          "Breakfast",
          "Snacks"
        ]
      },
      {
        name: "Ghugni",
        emoji: "🫘",
        time: "35 min",
        diff: "Easy",
        cal: 240,
        protein: "12g",
        tags: [
          "Snacks",
          "Dinner"
        ]
      },
      {
        name: "Tilkut",
        emoji: "🍬",
        time: "40 min",
        diff: "Medium",
        cal: 290,
        protein: "5g",
        tags: [
          "Snacks"
        ]
      },
      {
        name: "Baigan Bharta",
        emoji: "🍆",
        time: "30 min",
        diff: "Easy",
        cal: 160,
        protein: "4g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Pua",
        emoji: "🧇",
        time: "20 min",
        diff: "Easy",
        cal: 300,
        protein: "6g",
        tags: [
          "Breakfast",
          "Dessert"
        ]
      },
      {
        name: "Khichdi",
        emoji: "🍛",
        time: "30 min",
        diff: "Easy",
        cal: 350,
        protein: "11g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Rabri",
        emoji: "🍮",
        time: "50 min",
        diff: "Medium",
        cal: 310,
        protein: "9g",
        tags: [
          "Dessert"
        ]
      },
      {
        name: "Sattu Sharbat",
        emoji: "🥤",
        time: "5 min",
        diff: "Easy",
        cal: 140,
        protein: "8g",
        tags: [
          "Drinks"
        ]
      },
      {
        name: "Chana Ghugni",
        emoji: "🫘",
        time: "30 min",
        diff: "Easy",
        cal: 220,
        protein: "10g",
        tags: [
          "Snacks"
        ]
      },
      {
        name: "Dal Tadka Bihari",
        emoji: "🍲",
        time: "35 min",
        diff: "Easy",
        cal: 270,
        protein: "13g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Bhunja Chana",
        emoji: "🌰",
        time: "15 min",
        diff: "Easy",
        cal: 190,
        protein: "11g",
        tags: [
          "Snacks"
        ]
      },
      {
        name: "Parwal Ki Sabzi",
        emoji: "🥗",
        time: "25 min",
        diff: "Easy",
        cal: 150,
        protein: "4g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      }
    ]
  },
  {
    state: "Madhya Pradesh",
    emoji: "🐯",
    color: "#E67E22",
    dishes: [
      {
        name: "Dal Bafla",
        emoji: "🍚",
        time: "90 min",
        diff: "Hard",
        cal: 460,
        protein: "16g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Poha Indori",
        emoji: "🍽",
        time: "15 min",
        diff: "Easy",
        cal: 250,
        protein: "6g",
        tags: [
          "Breakfast"
        ]
      },
      {
        name: "Bhutte Ki Kees",
        emoji: "🌽",
        time: "20 min",
        diff: "Easy",
        cal: 210,
        protein: "5g",
        tags: [
          "Snacks",
          "Breakfast"
        ]
      },
      {
        name: "Seekh Kebab",
        emoji: "🍢",
        time: "40 min",
        diff: "Medium",
        cal: 350,
        protein: "25g",
        tags: [
          "Snacks",
          "Dinner"
        ]
      },
      {
        name: "Chakki Ki Shak",
        emoji: "🥘",
        time: "35 min",
        diff: "Medium",
        cal: 290,
        protein: "8g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Mawa Bati",
        emoji: "🧆",
        time: "50 min",
        diff: "Medium",
        cal: 420,
        protein: "10g",
        tags: [
          "Dessert",
          "Snacks"
        ]
      },
      {
        name: "Ratlami Sev",
        emoji: "🍟",
        time: "45 min",
        diff: "Medium",
        cal: 310,
        protein: "7g",
        tags: [
          "Snacks"
        ]
      },
      {
        name: "Sabudana Khichdi",
        emoji: "🍥",
        time: "20 min",
        diff: "Easy",
        cal: 280,
        protein: "4g",
        tags: [
          "Breakfast",
          "Snacks"
        ]
      },
      {
        name: "Shikanji",
        emoji: "🍋",
        time: "5 min",
        diff: "Easy",
        cal: 80,
        protein: "1g",
        tags: [
          "Drinks"
        ]
      },
      {
        name: "Lavang Lata",
        emoji: "🍩",
        time: "40 min",
        diff: "Medium",
        cal: 330,
        protein: "6g",
        tags: [
          "Dessert"
        ]
      },
      {
        name: "Palak Puri",
        emoji: "🫓",
        time: "30 min",
        diff: "Easy",
        cal: 270,
        protein: "7g",
        tags: [
          "Breakfast",
          "Lunch"
        ]
      },
      {
        name: "Gur Papdi",
        emoji: "🍯",
        time: "25 min",
        diff: "Easy",
        cal: 280,
        protein: "5g",
        tags: [
          "Snacks",
          "Dessert"
        ]
      },
      {
        name: "Mutton Rogan Josh MP Style",
        emoji: "🍖",
        time: "75 min",
        diff: "Hard",
        cal: 490,
        protein: "30g",
        tags: [
          "Dinner"
        ]
      },
      {
        name: "Makai Ki Roti",
        emoji: "🫓",
        time: "20 min",
        diff: "Medium",
        cal: 230,
        protein: "6g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Biryani Bhopal Style",
        emoji: "🍛",
        time: "80 min",
        diff: "Hard",
        cal: 520,
        protein: "22g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      }
    ]
  },
  {
    state: "Odisha",
    emoji: "🌊",
    color: "#3498DB",
    dishes: [
      {
        name: "Dalma",
        emoji: "🥘",
        time: "40 min",
        diff: "Medium",
        cal: 290,
        protein: "14g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Pakhala Bhata",
        emoji: "🍚",
        time: "480 min",
        diff: "Easy",
        cal: 200,
        protein: "4g",
        tags: [
          "Lunch"
        ]
      },
      {
        name: "Chhena Poda",
        emoji: "🧀",
        time: "60 min",
        diff: "Medium",
        cal: 380,
        protein: "14g",
        tags: [
          "Dessert"
        ]
      },
      {
        name: "Machha Besara",
        emoji: "🐟",
        time: "45 min",
        diff: "Medium",
        cal: 320,
        protein: "22g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Bara",
        emoji: "🫓",
        time: "30 min",
        diff: "Easy",
        cal: 240,
        protein: "10g",
        tags: [
          "Breakfast",
          "Snacks"
        ]
      },
      {
        name: "Rasabali",
        emoji: "🍮",
        time: "50 min",
        diff: "Medium",
        cal: 350,
        protein: "11g",
        tags: [
          "Dessert"
        ]
      },
      {
        name: "Chakuli Pitha",
        emoji: "🥞",
        time: "30 min",
        diff: "Easy",
        cal: 220,
        protein: "5g",
        tags: [
          "Breakfast"
        ]
      },
      {
        name: "Enduri Pitha",
        emoji: "🫕",
        time: "40 min",
        diff: "Medium",
        cal: 260,
        protein: "8g",
        tags: [
          "Breakfast",
          "Snacks"
        ]
      },
      {
        name: "Chhena Jhili",
        emoji: "🍡",
        time: "35 min",
        diff: "Medium",
        cal: 290,
        protein: "10g",
        tags: [
          "Dessert",
          "Snacks"
        ]
      },
      {
        name: "Santula",
        emoji: "🥗",
        time: "25 min",
        diff: "Easy",
        cal: 160,
        protein: "5g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Mudhi Mansa",
        emoji: "🍗",
        time: "50 min",
        diff: "Medium",
        cal: 430,
        protein: "26g",
        tags: [
          "Snacks",
          "Dinner"
        ]
      },
      {
        name: "Khaja",
        emoji: "🍯",
        time: "45 min",
        diff: "Medium",
        cal: 310,
        protein: "4g",
        tags: [
          "Dessert",
          "Snacks"
        ]
      },
      {
        name: "Macha Ghanta",
        emoji: "🐡",
        time: "35 min",
        diff: "Medium",
        cal: 270,
        protein: "18g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Dahi Baigana",
        emoji: "🍆",
        time: "20 min",
        diff: "Easy",
        cal: 180,
        protein: "6g",
        tags: [
          "Lunch"
        ]
      },
      {
        name: "Arisa Pitha",
        emoji: "🍪",
        time: "40 min",
        diff: "Medium",
        cal: 300,
        protein: "4g",
        tags: [
          "Snacks",
          "Dessert"
        ]
      }
    ]
  },
  {
    state: "Jharkhand",
    emoji: "🌿",
    color: "#27AE60",
    dishes: [
      {
        name: "Litti Chokha",
        emoji: "🍚",
        time: "60 min",
        diff: "Medium",
        cal: 420,
        protein: "14g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Rugda",
        emoji: "🍄",
        time: "30 min",
        diff: "Easy",
        cal: 180,
        protein: "6g",
        tags: [
          "Lunch",
          "Snacks"
        ]
      },
      {
        name: "Pittha",
        emoji: "🫕",
        time: "40 min",
        diff: "Medium",
        cal: 250,
        protein: "8g",
        tags: [
          "Breakfast"
        ]
      },
      {
        name: "Handia Rice Beer",
        emoji: "🍶",
        time: "120 min",
        diff: "Hard",
        cal: 100,
        protein: "2g",
        tags: [
          "Drinks"
        ]
      },
      {
        name: "Aloo Chokha",
        emoji: "🥔",
        time: "20 min",
        diff: "Easy",
        cal: 180,
        protein: "4g",
        tags: [
          "Breakfast",
          "Snacks"
        ]
      },
      {
        name: "Bamboo Shoot Curry",
        emoji: "🎋",
        time: "45 min",
        diff: "Medium",
        cal: 160,
        protein: "5g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Mahua Laddu",
        emoji: "🍡",
        time: "35 min",
        diff: "Medium",
        cal: 280,
        protein: "4g",
        tags: [
          "Dessert",
          "Snacks"
        ]
      },
      {
        name: "Chilka Roti",
        emoji: "🫓",
        time: "20 min",
        diff: "Easy",
        cal: 240,
        protein: "7g",
        tags: [
          "Breakfast"
        ]
      },
      {
        name: "Ragi Roti",
        emoji: "🫓",
        time: "20 min",
        diff: "Easy",
        cal: 210,
        protein: "6g",
        tags: [
          "Breakfast",
          "Lunch"
        ]
      },
      {
        name: "Mutton Jharkhand Style",
        emoji: "🍖",
        time: "70 min",
        diff: "Hard",
        cal: 460,
        protein: "27g",
        tags: [
          "Dinner"
        ]
      },
      {
        name: "Tilkut",
        emoji: "🍬",
        time: "40 min",
        diff: "Medium",
        cal: 290,
        protein: "5g",
        tags: [
          "Snacks",
          "Dessert"
        ]
      },
      {
        name: "Dhuska",
        emoji: "🥐",
        time: "25 min",
        diff: "Easy",
        cal: 280,
        protein: "8g",
        tags: [
          "Breakfast",
          "Snacks"
        ]
      },
      {
        name: "Chana Dal Puri",
        emoji: "🫓",
        time: "35 min",
        diff: "Medium",
        cal: 330,
        protein: "12g",
        tags: [
          "Breakfast",
          "Lunch"
        ]
      }
    ]
  },
  {
    state: "Uttarakhand",
    emoji: "🏔️",
    color: "#1ABC9C",
    dishes: [
      {
        name: "Kafuli",
        emoji: "🥬",
        time: "35 min",
        diff: "Medium",
        cal: 180,
        protein: "8g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Aloo Ke Gutke",
        emoji: "🥔",
        time: "25 min",
        diff: "Easy",
        cal: 220,
        protein: "4g",
        tags: [
          "Breakfast",
          "Snacks"
        ]
      },
      {
        name: "Bhang Ki Chutney",
        emoji: "🌿",
        time: "10 min",
        diff: "Easy",
        cal: 60,
        protein: "2g",
        tags: [
          "Snacks"
        ]
      },
      {
        name: "Bal Mithai",
        emoji: "🍫",
        time: "45 min",
        diff: "Medium",
        cal: 340,
        protein: "8g",
        tags: [
          "Dessert",
          "Snacks"
        ]
      },
      {
        name: "Singori",
        emoji: "🍡",
        time: "30 min",
        diff: "Medium",
        cal: 280,
        protein: "7g",
        tags: [
          "Dessert"
        ]
      },
      {
        name: "Chainsoo",
        emoji: "🥘",
        time: "40 min",
        diff: "Medium",
        cal: 260,
        protein: "12g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Phanu",
        emoji: "🍲",
        time: "50 min",
        diff: "Medium",
        cal: 280,
        protein: "14g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Jhangore Ki Kheer",
        emoji: "🍮",
        time: "40 min",
        diff: "Easy",
        cal: 300,
        protein: "6g",
        tags: [
          "Dessert"
        ]
      },
      {
        name: "Mandua Roti",
        emoji: "🫓",
        time: "20 min",
        diff: "Easy",
        cal: 200,
        protein: "6g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Gahat Dal",
        emoji: "🫘",
        time: "50 min",
        diff: "Medium",
        cal: 270,
        protein: "15g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Kumaoni Raita",
        emoji: "🥛",
        time: "10 min",
        diff: "Easy",
        cal: 120,
        protein: "5g",
        tags: [
          "Lunch"
        ]
      },
      {
        name: "Arsa",
        emoji: "🍪",
        time: "35 min",
        diff: "Medium",
        cal: 310,
        protein: "4g",
        tags: [
          "Snacks",
          "Dessert"
        ]
      },
      {
        name: "Badi Aur Cholia",
        emoji: "🥗",
        time: "40 min",
        diff: "Medium",
        cal: 230,
        protein: "10g",
        tags: [
          "Lunch"
        ]
      }
    ]
  },
  {
    state: "Haryana",
    emoji: "🌾",
    color: "#F1C40F",
    dishes: [
      {
        name: "Bajra Khichdi",
        emoji: "🍛",
        time: "35 min",
        diff: "Easy",
        cal: 320,
        protein: "10g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Kadhi Pakora",
        emoji: "🍲",
        time: "40 min",
        diff: "Medium",
        cal: 270,
        protein: "9g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Singri Ki Sabzi",
        emoji: "🥗",
        time: "30 min",
        diff: "Easy",
        cal: 160,
        protein: "5g",
        tags: [
          "Lunch"
        ]
      },
      {
        name: "Kachri Ki Chutney",
        emoji: "🌶",
        time: "10 min",
        diff: "Easy",
        cal: 40,
        protein: "1g",
        tags: [
          "Snacks"
        ]
      },
      {
        name: "Hara Dhania Cholia",
        emoji: "🌿",
        time: "25 min",
        diff: "Easy",
        cal: 200,
        protein: "9g",
        tags: [
          "Snacks",
          "Lunch"
        ]
      },
      {
        name: "Bathua Raita",
        emoji: "🥛",
        time: "10 min",
        diff: "Easy",
        cal: 110,
        protein: "4g",
        tags: [
          "Lunch"
        ]
      },
      {
        name: "Aloo Methi",
        emoji: "🥔",
        time: "25 min",
        diff: "Easy",
        cal: 210,
        protein: "5g",
        tags: [
          "Breakfast",
          "Lunch"
        ]
      },
      {
        name: "Bajra Roti",
        emoji: "🫓",
        time: "20 min",
        diff: "Easy",
        cal: 240,
        protein: "6g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Dahi Bhalle",
        emoji: "🥣",
        time: "30 min",
        diff: "Medium",
        cal: 280,
        protein: "10g",
        tags: [
          "Snacks",
          "Lunch"
        ]
      },
      {
        name: "Maa Ki Dal",
        emoji: "🫘",
        time: "45 min",
        diff: "Medium",
        cal: 290,
        protein: "14g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Churma",
        emoji: "🍯",
        time: "30 min",
        diff: "Easy",
        cal: 380,
        protein: "7g",
        tags: [
          "Dessert",
          "Snacks"
        ]
      },
      {
        name: "Kheer Makhane Ki",
        emoji: "🍮",
        time: "35 min",
        diff: "Easy",
        cal: 320,
        protein: "8g",
        tags: [
          "Dessert"
        ]
      },
      {
        name: "Besan Masala Roti",
        emoji: "🫓",
        time: "25 min",
        diff: "Easy",
        cal: 260,
        protein: "8g",
        tags: [
          "Breakfast",
          "Lunch"
        ]
      },
      {
        name: "Mithe Chawal",
        emoji: "🍚",
        time: "25 min",
        diff: "Easy",
        cal: 310,
        protein: "4g",
        tags: [
          "Dessert"
        ]
      }
    ]
  },
  {
    state: "Assam",
    emoji: "🍵",
    color: "#16A085",
    dishes: [
      {
        name: "Masor Tenga",
        emoji: "🐟",
        time: "40 min",
        diff: "Medium",
        cal: 280,
        protein: "22g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Aloo Pitika",
        emoji: "🥔",
        time: "15 min",
        diff: "Easy",
        cal: 160,
        protein: "4g",
        tags: [
          "Breakfast",
          "Snacks"
        ]
      },
      {
        name: "Duck Curry",
        emoji: "🦆",
        time: "75 min",
        diff: "Hard",
        cal: 490,
        protein: "28g",
        tags: [
          "Dinner"
        ]
      },
      {
        name: "Pitha",
        emoji: "🥞",
        time: "35 min",
        diff: "Medium",
        cal: 260,
        protein: "6g",
        tags: [
          "Breakfast",
          "Snacks"
        ]
      },
      {
        name: "Khar",
        emoji: "🥘",
        time: "35 min",
        diff: "Medium",
        cal: 220,
        protein: "5g",
        tags: [
          "Lunch"
        ]
      },
      {
        name: "Xaak Bhaji",
        emoji: "🥬",
        time: "20 min",
        diff: "Easy",
        cal: 120,
        protein: "4g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Ou Tenga Maas",
        emoji: "🍋",
        time: "40 min",
        diff: "Medium",
        cal: 260,
        protein: "20g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Bhapot Diya Maas",
        emoji: "🐠",
        time: "30 min",
        diff: "Easy",
        cal: 240,
        protein: "21g",
        tags: [
          "Dinner"
        ]
      },
      {
        name: "Til Pitha",
        emoji: "🥞",
        time: "30 min",
        diff: "Medium",
        cal: 280,
        protein: "7g",
        tags: [
          "Breakfast",
          "Snacks"
        ]
      },
      {
        name: "Assam Biryani",
        emoji: "🍛",
        time: "70 min",
        diff: "Hard",
        cal: 500,
        protein: "22g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Jolpan",
        emoji: "🥣",
        time: "10 min",
        diff: "Easy",
        cal: 230,
        protein: "5g",
        tags: [
          "Breakfast"
        ]
      },
      {
        name: "Sunga Pitha",
        emoji: "🎋",
        time: "45 min",
        diff: "Medium",
        cal: 250,
        protein: "6g",
        tags: [
          "Snacks"
        ]
      },
      {
        name: "Narikolor Laru",
        emoji: "🥥",
        time: "30 min",
        diff: "Easy",
        cal: 320,
        protein: "3g",
        tags: [
          "Dessert",
          "Snacks"
        ]
      },
      {
        name: "Mustard Fish",
        emoji: "🐡",
        time: "35 min",
        diff: "Medium",
        cal: 290,
        protein: "23g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      }
    ]
  },
  {
    state: "Manipur",
    emoji: "🌺",
    color: "#8E44AD",
    dishes: [
      {
        name: "Eromba",
        emoji: "🌶",
        time: "30 min",
        diff: "Medium",
        cal: 200,
        protein: "8g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Iromba",
        emoji: "🍲",
        time: "35 min",
        diff: "Medium",
        cal: 210,
        protein: "9g",
        tags: [
          "Lunch"
        ]
      },
      {
        name: "Singju",
        emoji: "🥗",
        time: "20 min",
        diff: "Easy",
        cal: 120,
        protein: "4g",
        tags: [
          "Snacks",
          "Lunch"
        ]
      },
      {
        name: "Champhut",
        emoji: "🥬",
        time: "25 min",
        diff: "Easy",
        cal: 150,
        protein: "6g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Ngri Fish Curry",
        emoji: "🐟",
        time: "40 min",
        diff: "Medium",
        cal: 280,
        protein: "22g",
        tags: [
          "Dinner"
        ]
      },
      {
        name: "Kangsoi",
        emoji: "🥘",
        time: "30 min",
        diff: "Easy",
        cal: 190,
        protein: "7g",
        tags: [
          "Lunch"
        ]
      },
      {
        name: "Paaknam",
        emoji: "🍥",
        time: "40 min",
        diff: "Medium",
        cal: 230,
        protein: "8g",
        tags: [
          "Breakfast",
          "Snacks"
        ]
      },
      {
        name: "Chak Hao Kheer",
        emoji: "🍮",
        time: "40 min",
        diff: "Easy",
        cal: 300,
        protein: "6g",
        tags: [
          "Dessert"
        ]
      },
      {
        name: "Tan Ngang",
        emoji: "🥣",
        time: "15 min",
        diff: "Easy",
        cal: 140,
        protein: "5g",
        tags: [
          "Breakfast"
        ]
      },
      {
        name: "Ooti",
        emoji: "🫘",
        time: "35 min",
        diff: "Easy",
        cal: 220,
        protein: "11g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Morok Metpa",
        emoji: "🌶",
        time: "15 min",
        diff: "Easy",
        cal: 60,
        protein: "2g",
        tags: [
          "Snacks"
        ]
      },
      {
        name: "Nga Thongba",
        emoji: "🐠",
        time: "35 min",
        diff: "Medium",
        cal: 260,
        protein: "20g",
        tags: [
          "Dinner"
        ]
      },
      {
        name: "Sareng Fish Curry",
        emoji: "🎣",
        time: "45 min",
        diff: "Medium",
        cal: 290,
        protein: "24g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      }
    ]
  },
  {
    state: "Sikkim",
    emoji: "🏔️",
    color: "#2980B9",
    dishes: [
      {
        name: "Momos",
        emoji: "🥟",
        time: "45 min",
        diff: "Medium",
        cal: 280,
        protein: "14g",
        tags: [
          "Snacks",
          "Dinner"
        ]
      },
      {
        name: "Phagshapa",
        emoji: "🥩",
        time: "50 min",
        diff: "Medium",
        cal: 380,
        protein: "22g",
        tags: [
          "Dinner"
        ]
      },
      {
        name: "Thukpa",
        emoji: "🍜",
        time: "35 min",
        diff: "Easy",
        cal: 310,
        protein: "14g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Gundruk",
        emoji: "🥬",
        time: "15 min",
        diff: "Easy",
        cal: 130,
        protein: "5g",
        tags: [
          "Snacks",
          "Lunch"
        ]
      },
      {
        name: "Sel Roti",
        emoji: "🍩",
        time: "30 min",
        diff: "Medium",
        cal: 290,
        protein: "5g",
        tags: [
          "Breakfast",
          "Snacks"
        ]
      },
      {
        name: "Sha Phaley",
        emoji: "🥙",
        time: "40 min",
        diff: "Medium",
        cal: 340,
        protein: "16g",
        tags: [
          "Snacks",
          "Dinner"
        ]
      },
      {
        name: "Chhurpi Soup",
        emoji: "🍲",
        time: "25 min",
        diff: "Easy",
        cal: 200,
        protein: "12g",
        tags: [
          "Lunch"
        ]
      },
      {
        name: "Sinki",
        emoji: "🫚",
        time: "15 min",
        diff: "Easy",
        cal: 80,
        protein: "3g",
        tags: [
          "Snacks"
        ]
      },
      {
        name: "Sael Roti",
        emoji: "🍞",
        time: "30 min",
        diff: "Medium",
        cal: 280,
        protein: "5g",
        tags: [
          "Breakfast"
        ]
      },
      {
        name: "Kinema Curry",
        emoji: "🫘",
        time: "30 min",
        diff: "Medium",
        cal: 240,
        protein: "13g",
        tags: [
          "Lunch",
          "Dinner"
        ]
      },
      {
        name: "Buckwheat Pancake",
        emoji: "🥞",
        time: "20 min",
        diff: "Easy",
        cal: 220,
        protein: "6g",
        tags: [
          "Breakfast"
        ]
      },
      {
        name: "Tsampa Porridge",
        emoji: "🥣",
        time: "15 min",
        diff: "Easy",
        cal: 260,
        protein: "8g",
        tags: [
          "Breakfast"
        ]
      },
      {
        name: "Wai Wai Salad",
        emoji: "🥗",
        time: "10 min",
        diff: "Easy",
        cal: 200,
        protein: "5g",
        tags: [
          "Snacks"
        ]
      }
    ]
  }
];
const WORLD = [
  { country:"Italy", emoji:"🇮🇹", color:"#E74C3C", dishes:[
    {name:"Spaghetti Carbonara",emoji:"🍝",time:"25 min",diff:"Medium",cal:580,protein:"24g",tags:["Dinner"]},
    {name:"Margherita Pizza",emoji:"🍕",time:"30 min",diff:"Easy",cal:700,protein:"28g",tags:["Dinner"]},
    {name:"Tiramisu",emoji:"🍮",time:"20 min",diff:"Medium",cal:380,protein:"8g",tags:["Dessert"]},
    {name:"Risotto",emoji:"🍚",time:"35 min",diff:"Medium",cal:480,protein:"16g",tags:["Dinner"]},
  ]},
  { country:"Japan", emoji:"🇯🇵", color:"#FF3CAC", dishes:[
    {name:"Ramen",emoji:"🍜",time:"45 min",diff:"Medium",cal:520,protein:"28g",tags:["Dinner"]},
    {name:"Sushi",emoji:"🍣",time:"30 min",diff:"Hard",cal:320,protein:"20g",tags:["Lunch"]},
    {name:"Tempura",emoji:"🍤",time:"25 min",diff:"Medium",cal:420,protein:"16g",tags:["Dinner"]},
    {name:"Miso Soup",emoji:"🍵",time:"10 min",diff:"Easy",cal:80,protein:"6g",tags:["Breakfast"]},
  ]},
  { country:"Mexico", emoji:"🇲🇽", color:"#F39C12", dishes:[
    {name:"Tacos al Pastor",emoji:"🌮",time:"30 min",diff:"Medium",cal:480,protein:"26g",tags:["Lunch"]},
    {name:"Guacamole",emoji:"🥑",time:"10 min",diff:"Easy",cal:180,protein:"3g",tags:["Snacks"]},
    {name:"Enchiladas",emoji:"🫔",time:"40 min",diff:"Medium",cal:520,protein:"22g",tags:["Dinner"]},
  ]},
  { country:"Thailand", emoji:"🇹🇭", color:"#F39C12", dishes:[
    {name:"Pad Thai",emoji:"🍜",time:"20 min",diff:"Medium",cal:450,protein:"22g",tags:["Dinner"]},
    {name:"Green Curry",emoji:"🍛",time:"30 min",diff:"Medium",cal:380,protein:"18g",tags:["Dinner"]},
    {name:"Tom Yum",emoji:"🫕",time:"25 min",diff:"Easy",cal:180,protein:"14g",tags:["Lunch"]},
  ]},
  { country:"China", emoji:"🇨🇳", color:"#E74C3C", dishes:[
    {name:"Kung Pao Chicken",emoji:"🍗",time:"25 min",diff:"Medium",cal:420,protein:"32g",tags:["Dinner"]},
    {name:"Dim Sum",emoji:"🥟",time:"40 min",diff:"Hard",cal:280,protein:"14g",tags:["Snacks"]},
    {name:"Mapo Tofu",emoji:"🍲",time:"20 min",diff:"Easy",cal:320,protein:"18g",tags:["Dinner"]},
  ]},
  { country:"France", emoji:"🇫🇷", color:"#3498DB", dishes:[
    {name:"Croissant",emoji:"🥐",time:"180 min",diff:"Hard",cal:380,protein:"8g",tags:["Breakfast"]},
    {name:"Ratatouille",emoji:"🫕",time:"60 min",diff:"Medium",cal:220,protein:"6g",tags:["Dinner"]},
    {name:"Crème Brûlée",emoji:"🍮",time:"45 min",diff:"Medium",cal:340,protein:"6g",tags:["Dessert"]},
  ]},
  { country:"Morocco", emoji:"🇲🇦", color:"#E67E22", dishes:[
    {name:"Chicken Tagine",emoji:"🍲",time:"75 min",diff:"Medium",cal:420,protein:"32g",tags:["Dinner"]},
    {name:"Couscous",emoji:"🍚",time:"30 min",diff:"Easy",cal:340,protein:"12g",tags:["Lunch"]},
    {name:"Harira Soup",emoji:"🫕",time:"45 min",diff:"Easy",cal:220,protein:"12g",tags:["Lunch"]},
  ]},
];

// ── DESIGN TOKENS ─────────────────────────────────────────────
const C = {
  bg:"#0F1117", card:"#1A1D27", border:"#2A2D3E",
  accent:"#FF6B35", accentS:"rgba(255,107,53,0.12)",
  a2:"#4ECDC4", a2S:"rgba(78,205,196,0.12)",
  txt:"#F0F2FF", muted:"#8B8FA8", sub:"#5A5E78",
  ok:"#2ECC71", okS:"rgba(46,204,113,0.1)",
  warn:"#F39C12", warnS:"rgba(243,156,18,0.1)",
  red:"#E74C3C", redS:"rgba(231,76,60,0.1)",
  gA:"#FF6B35", gB:"#FF3CAC",
};
const grad = `linear-gradient(135deg,${C.gA},${C.gB})`;
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{background:#0F1117;height:100%;overscroll-behavior:none;}
body{font-family:'DM Sans',system-ui,sans-serif;}
input,button,textarea{font-family:inherit;}
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-thumb{background:#2A2D3E;border-radius:4px;}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes scanLine{0%{top:0%}100%{top:100%}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes bounceIn{0%{transform:scale(0.5);opacity:0}80%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
.fade-in{animation:fadeIn 0.3s ease forwards;}
.slide-up{animation:slideUp 0.35s ease forwards;}
.bounce-in{animation:bounceIn 0.4s ease forwards;}
.shimmer{background:linear-gradient(90deg,#1A1D27 25%,#252838 50%,#1A1D27 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
.spin{animation:spin 0.8s linear infinite;}
.bubble-user{background:linear-gradient(135deg,#FF6B35,#FF3CAC);color:#fff;border-radius:18px 18px 4px 18px;padding:10px 14px;font-size:13px;max-width:82%;margin-left:auto;line-height:1.5;}
.bubble-ai{background:#1A1D27;border:1px solid #2A2D3E;color:#F0F2FF;border-radius:18px 18px 18px 4px;padding:10px 14px;font-size:13px;max-width:86%;line-height:1.5;}
`;
const ST = {
  app:{minHeight:"100vh",background:C.bg,color:C.txt,fontFamily:"'DM Sans',system-ui",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column"},
  hdr:{padding:"12px 16px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",background:C.bg,borderBottom:`1px solid ${C.border}`,flexShrink:0,position:"sticky",top:0,zIndex:100},
  logo:{fontSize:18,fontWeight:800,background:grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  scr:{padding:"12px 14px 88px",overflowY:"auto",flex:1},
  card:{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"14px",marginBottom:10},
  inp:{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 13px",color:C.txt,fontSize:14,outline:"none",boxSizing:"border-box"},
  nav:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.card,borderTop:`1px solid ${C.border}`,display:"flex",padding:"5px 0 10px",zIndex:200},
};
const mkBtn = (v="primary", sz="md") => {
  const pad = sz==="sm"?"6px 10px":sz==="lg"?"14px 20px":"10px 15px";
  const fs = sz==="sm"?12:sz==="lg"?15:13;
  const base = {display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:pad,borderRadius:12,border:"none",cursor:"pointer",fontWeight:700,fontSize:fs,transition:"all 0.15s",flexShrink:0};
  if(v==="primary") return {...base,background:grad,color:"#fff"};
  if(v==="out") return {...base,background:"transparent",border:`1px solid ${C.border}`,color:C.txt};
  if(v==="ghost") return {...base,background:C.accentS,color:C.accent};
  if(v==="ok") return {...base,background:C.okS,color:C.ok,border:`1px solid ${C.ok}33`};
  if(v==="red") return {...base,background:C.redS,color:C.red,border:`1px solid ${C.red}33`};
  return {...base,background:C.card,border:`1px solid ${C.border}`,color:C.txt};
};
const mkTag = (col=C.accent) => ({display:"inline-flex",alignItems:"center",padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,background:col+"22",color:col,border:`1px solid ${col}33`});
const mkPill = (col=C.accent) => ({display:"inline-block",padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,background:col+"22",color:col,border:`1px solid ${col}33`});

// ── TRANSLATIONS ──────────────────────────────────────────────
const TR = {
  en:{home:"Home",scan:"Scan",planner:"Planner",leftover:"Leftover",grocery:"Grocery",favorites:"Favorites",settings:"Settings",india:"India",world:"World",tracker:"Tracker",aiPicks:"✨ AI Picks",todaysRecipes:"Today's Recipes",recentRecipes:"Recent Recipes",scanIngredients:"Scan Ingredients",mealPlanner:"Meal Planner",leftoverRescue:"Leftover Rescue",smartGrocery:"Smart Grocery",startCooking:"Start Cooking",refresh:"Refresh",back:"Back",readStep:"Read Step",prevStep:"← Prev",nextStep:"Next →",done:"🎉 Done!",ingredients:"Ingredients",nutrition:"Nutrition",steps:"Steps",videos:"Videos",generate:"Generate",addFav:"Save",noFavs:"No favorites yet",noRecent:"No recent recipes",calories:"Calories",protein:"Protein",carbs:"Carbs",fat:"Fat",language:"Language",selectDay:"Select Day",mealType:"Meal Type",howMany:"How many people?",cookFor:"Cook for",people:"people",quickAdd:"Quick add",typeLeftover:"Type a leftover...",enterRecipe:"Enter recipe name...",checkedOf:"items checked",alternatives:"Alternatives",rescueLeftovers:"Rescue My Leftovers!",startOver:"Start Over",noVideos:"No videos",watchYT:"Watch on YouTube",exploreIndia:"Explore India",worldCuisines:"World Cuisines",nutritionTracker:"Nutrition Tracker",logMeal:"Log This Meal",todayLog:"Today's Log",calorieGoal:"Calorie Goal",remaining:"remaining",demoMode:"DEMO",liveMode:"LIVE",addMore:"Add more...",rescan:"Rescan",scanning:"Analyzing...",tapPhoto:"Tap to Take Photo",uploadPhoto:"Upload Photo",shoppingTips:"Shopping Tips",chatPlaceholder:"Ask anything about cooking...",chatTitle:"CookMate Assistant"},
  hi:{home:"होम",scan:"स्कैन",planner:"प्लानर",leftover:"बचा खाना",grocery:"किराना",favorites:"पसंदीदा",settings:"सेटिंग्स",india:"भारत",world:"विश्व",tracker:"ट्रैकर",aiPicks:"✨ AI की पसंद",todaysRecipes:"आज की रेसिपी",recentRecipes:"हाल की रेसिपी",scanIngredients:"सामग्री स्कैन",mealPlanner:"भोजन योजना",leftoverRescue:"बचे खाने से बनाएं",smartGrocery:"किराना सूची",startCooking:"पकाना शुरू",refresh:"रिफ्रेश",back:"वापस",readStep:"पढ़ें",prevStep:"← पिछला",nextStep:"अगला →",done:"🎉 शानदार!",ingredients:"सामग्री",nutrition:"पोषण",steps:"चरण",videos:"वीडियो",generate:"बनाएं",addFav:"सेव",noFavs:"कोई पसंदीदा नहीं",noRecent:"हाल की कोई रेसिपी नहीं",calories:"कैलोरी",protein:"प्रोटीन",carbs:"कार्ब्स",fat:"वसा",language:"भाषा",selectDay:"दिन चुनें",mealType:"भोजन प्रकार",howMany:"कितने लोगों के लिए?",cookFor:"के लिए",people:"लोग",quickAdd:"जल्दी जोड़ें",typeLeftover:"बचा खाना लिखें...",enterRecipe:"रेसिपी का नाम...",checkedOf:"आइटम चेक",alternatives:"विकल्प",rescueLeftovers:"रेसिपी बनाएं!",startOver:"फिर शुरू",noVideos:"वीडियो नहीं",watchYT:"YouTube पर देखें",exploreIndia:"भारत खोजें",worldCuisines:"विश्व व्यंजन",nutritionTracker:"पोषण ट्रैकर",logMeal:"खाना लॉग करें",todayLog:"आज का लॉग",calorieGoal:"कैलोरी लक्ष्य",remaining:"बचा है",demoMode:"डेमो",liveMode:"लाइव",addMore:"और जोड़ें...",rescan:"फिर स्कैन",scanning:"विश्लेषण...",tapPhoto:"फ़ोटो लें",uploadPhoto:"फ़ोटो अपलोड",shoppingTips:"खरीदारी टिप्स",chatPlaceholder:"खाने के बारे में पूछें...",chatTitle:"CookMate सहायक"},
  hinglish:{home:"Home",scan:"Scan",planner:"Planner",leftover:"Bacha Khaana",grocery:"Grocery",favorites:"Favorites",settings:"Settings",india:"India",world:"World",tracker:"Tracker",aiPicks:"✨ AI Picks",todaysRecipes:"Aaj ki Recipes",recentRecipes:"Recent Recipes",scanIngredients:"Ingredients Scan Karo",mealPlanner:"Meal Planner",leftoverRescue:"Bacha Khaana Rescue",smartGrocery:"Smart Grocery",startCooking:"Cooking Shuru",refresh:"Refresh",back:"Wapis",readStep:"Padho",prevStep:"← Pichla",nextStep:"Agla →",done:"🎉 Ho Gaya!",ingredients:"Ingredients",nutrition:"Nutrition",steps:"Steps",videos:"Videos",generate:"Banao",addFav:"Save Karo",noFavs:"Koi favorite nahi",noRecent:"Koi recent recipe nahi",calories:"Calories",protein:"Protein",carbs:"Carbs",fat:"Fat",language:"Language",selectDay:"Din Chuno",mealType:"Khaana Type",howMany:"Kitne logon ke liye?",cookFor:"ke liye",people:"log",quickAdd:"Jaldi daalo",typeLeftover:"Bacha khaana likho...",enterRecipe:"Recipe ka naam...",checkedOf:"items check",alternatives:"Alternatives",rescueLeftovers:"Rescue Karo!",startOver:"Phir Shuru",noVideos:"Koi video nahi",watchYT:"YouTube pe Dekho",exploreIndia:"India Explore Karo",worldCuisines:"World Cuisines",nutritionTracker:"Nutrition Tracker",logMeal:"Meal Log Karo",todayLog:"Aaj ka Log",calorieGoal:"Calorie Goal",remaining:"bacha hai",demoMode:"DEMO",liveMode:"LIVE",addMore:"Aur daalo...",rescan:"Dobara Scan",scanning:"Analyze ho raha hai...",tapPhoto:"Photo lo",uploadPhoto:"Photo Upload",shoppingTips:"Shopping Tips",chatPlaceholder:"Khaane ke baare mein poochho...",chatTitle:"CookMate Assistant"},
};
Object.keys(TR).forEach(l=>{if(l!=="en") TR[l]={...TR.en,...TR[l]};});

const LANGS = [
  {code:"en",label:"English",native:"English",flag:"🇬🇧",voice:["en-IN","en-US"]},
  {code:"hi",label:"Hindi",native:"हिंदी",flag:"🇮🇳",voice:["hi-IN"]},
  {code:"hinglish",label:"Hinglish",native:"Hinglish",flag:"🇮🇳",voice:["hi-IN","en-IN"]},
  {code:"ta",label:"Tamil",native:"தமிழ்",flag:"🇮🇳",voice:["ta-IN"]},
  {code:"te",label:"Telugu",native:"తెలుగు",flag:"🇮🇳",voice:["te-IN"]},
  {code:"bn",label:"Bengali",native:"বাংলা",flag:"🇮🇳",voice:["bn-IN"]},
  {code:"mr",label:"Marathi",native:"मराठी",flag:"🇮🇳",voice:["mr-IN"]},
  {code:"gu",label:"Gujarati",native:"ગુજરાતી",flag:"🇮🇳",voice:["gu-IN"]},
  {code:"kn",label:"Kannada",native:"ಕನ್ನಡ",flag:"🇮🇳",voice:["kn-IN"]},
  {code:"ml",label:"Malayalam",native:"മലയാളം",flag:"🇮🇳",voice:["ml-IN"]},
  {code:"pa",label:"Punjabi",native:"ਪੰਜਾਬੀ",flag:"🇮🇳",voice:["pa-IN"]},
];

// ── LOCAL STORAGE ─────────────────────────────────────────────
const LS = {
  get:(k,d=null)=>{try{const v=localStorage.getItem("cm5_"+k);return v?JSON.parse(v):d;}catch{return d;}},
  set:(k,v)=>{try{localStorage.setItem("cm5_"+k,JSON.stringify(v));}catch{}},
  addRecent:(r)=>{const a=LS.get("recent",[]);LS.set("recent",[{...r,viewedAt:Date.now()},...a.filter(x=>x.name!==r.name)].slice(0,30));},
  getRecent:()=>LS.get("recent",[]),
  toggleFav:(r)=>{const f=LS.get("favs",[]);const e=f.some(x=>x.name===r.name);LS.set("favs",e?f.filter(x=>x.name!==r.name):[{...r,savedAt:Date.now()},...f]);return!e;},
  isFav:(name)=>LS.get("favs",[]).some(r=>r.name===name),
  getFavs:()=>LS.get("favs",[]),
  addNutrLog:(e)=>{const l=LS.get("nl",[]);const today=new Date().toDateString();LS.set("nl",[{...e,date:today,time:Date.now()},...l].slice(0,200));},
  getTodayLog:()=>{const t=new Date().toDateString();return LS.get("nl",[]).filter(e=>e.date===t);},
};

// ── SUPABASE SERVICE — DB first, AI fallback ──────────────────
const SB = {
  ok(){ return !!(CFG.SUPABASE_URL && CFG.SUPABASE_KEY); },
  hdrs(){
    return {"Content-Type":"application/json","apikey":CFG.SUPABASE_KEY,"Authorization":`Bearer ${CFG.SUPABASE_KEY}`};
  },
  async searchByIngredients(ingredients){
    if(!this.ok()) return [];
    try{
      const res=await fetch("/api/supabase",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
       body:JSON.stringify({type:"ingredients"})
      });
      if(!res.ok) return [];
      const all=await res.json();
      const norm=ingredients.map(i=>i.toLowerCase().trim());
      return all.map(recipe=>{
        const rIngs=typeof recipe.ingredients==="string"?recipe.ingredients.toLowerCase().replace(/['\[\]]/g,"").split(",").map(i=>i.trim()):(recipe.ingredients||[]).map(i=>String(i).toLowerCase());
        const hits=norm.filter(u=>rIngs.some(r=>r.includes(u)||u.includes(r)));
        const score=rIngs.length>0?hits.length/rIngs.length:0;
        return{...recipe,matchScore:score};
      }).filter(r=>r.matchScore>=0.1).sort((a,b)=>b.matchScore-a.matchScore).slice(0,6)
       .map(r=>({...r,source:"db",emoji:r.emoji||"🍽️",time:r.minutes?r.minutes+" min":r.time||"30 min",diff:r.difficulty||r.diff||"Medium",cal:r.nutrition?.calories||r.cal||320,protein:r.nutrition?.protein||r.protein||"12g"}));
    }catch(e){console.error("SB search:",e);return [];}
  },
  async saveRecipe(recipe){
    if(!this.ok()) return;
    try{
      await fetch(`${CFG.SUPABASE_URL}/rest/v1/recipes`,{
        method:"POST",
        headers:{...this.hdrs(),"Prefer":"return=minimal"},
        body:JSON.stringify({name:recipe.name,emoji:recipe.emoji||"🍽️",cuisine:recipe.cuisine||"Indian",category:recipe.category||"General",ingredients:(recipe.ingredients||[]).map(i=>typeof i==="string"?i:i.item),instructions:recipe.steps||[],nutrition:recipe.nutrition||{},time_minutes:parseInt(recipe.time)||30,difficulty:recipe.diff||"Medium",source:"ai_generated",ai_generated:true}),
      });
    }catch(e){console.error("SB save:",e);}
  },
  async syncFav(userId,recipe,isFav){
    if(!this.ok()||!userId) return;
    try{
      if(isFav){
        await fetch(`${CFG.SUPABASE_URL}/rest/v1/user_favorites`,{method:"POST",headers:{...this.hdrs(),"Prefer":"return=minimal"},body:JSON.stringify({user_id:userId,recipe_name:recipe.name,recipe_data:recipe,saved_at:new Date().toISOString()})});
      } else {
        await fetch(`${CFG.SUPABASE_URL}/rest/v1/user_favorites?user_id=eq.${userId}&recipe_name=eq.${encodeURIComponent(recipe.name)}`,{method:"DELETE",headers:this.hdrs()});
      }
    }catch(e){console.error("SB fav:",e);}
  },
  // Auto-save AI-generated recipe for future DB hits
  async saveRecipe(recipe){
    if(!this.ok()) return;
    try{
      await fetch(`${CFG.SUPABASE_URL}/rest/v1/recipes`,{
        method:"POST",
        headers:{...this.hdrs(),"Prefer":"return=minimal"},
        body:JSON.stringify({name:recipe.name,emoji:recipe.emoji||"🍽️",cuisine:recipe.cuisine||"Indian",category:recipe.category||"General",ingredients:(recipe.ingredients||[]).map(i=>typeof i==="string"?i:i.item),instructions:recipe.steps||[],nutrition:recipe.nutrition||{},time_minutes:parseInt(recipe.time)||30,difficulty:recipe.diff||"Medium",source:"ai_generated",ai_generated:true}),
      });
    }catch(e){console.error("SB save:",e);}
  },
  // Sync favorites to Supabase
  async syncFav(userId,recipe,isFav){
    if(!this.ok()||!userId) return;
    try{
      if(isFav){
        await fetch(`${CFG.SUPABASE_URL}/rest/v1/user_favorites`,{method:"POST",headers:{...this.hdrs(),"Prefer":"return=minimal"},body:JSON.stringify({user_id:userId,recipe_name:recipe.name,recipe_data:recipe,saved_at:new Date().toISOString()})});
      } else {
        await fetch(`${CFG.SUPABASE_URL}/rest/v1/user_favorites?user_id=eq.${userId}&recipe_name=eq.${encodeURIComponent(recipe.name)}`,{method:"DELETE",headers:this.hdrs()});
      }
    }catch(e){console.error("SB fav:",e);}
  },
};
// ── CLAUDE API ────────────────────────────────────────────────
const Claude = {
  async call(messages, system="", maxTokens=1500){
    const body={model:CFG.CLAUDE_MODEL,max_tokens:maxTokens,messages};
    if(system) body.system=system;
    const res=await fetch("/api/claude",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body)
    });
    if(!res.ok) throw new Error("Claude " + res.status);
    const d=await res.json();
    return(d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
  },

  async callJSON(messages, system="", maxTokens=1500){
    try{
      const text=await this.call(messages,system,maxTokens);
      const clean=text.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();
      const start=clean.search(/[[{]/);
      return start!==-1?JSON.parse(clean.slice(start)):null;
    }catch{return null;}
  },
 async detectIngredients(base64, mime="image/jpeg"){
    const body={model:CFG.CLAUDE_MODEL,max_tokens:600,system:"Food vision AI. Only report what you can clearly see. Never invent items.",
      messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:mime,data:base64}},{type:"text",text:"List ONLY food ingredients visible. Return JSON:{ingredients:[{name,emoji,confidence}],notes:string}. No food → {ingredients:[],notes:'No food detected'}."}]}]};
    const res=await fetch("/api/claude",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body)
    });
    if(!res.ok) return null;
    const d=await res.json();
    const text=(d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
    try{const c=text.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();const s=c.indexOf("{");return s!==-1?JSON.parse(c.slice(s)):null;}
    catch{return null;}
  },
  getAIPicks:(count=16)=>Claude.callJSON([{role:"user",content:`Generate ${count} diverse Indian & world recipe picks today. Return JSON array:[{name,emoji,time,diff,cal,protein,tags,category,reason}]. category: Breakfast|Lunch|Dinner|Snacks.`}],"Indian cooking expert. Return ONLY valid JSON array.",2500),
  getFullRecipe:(name,servings=2)=>Claude.callJSON([{role:"user",content:`Full recipe for "${name}" for ${servings} people. Return JSON:{name,emoji,description,time,prepTime,cookTime,diff,servings,ingredients:[{item,amount,unit}],steps:[{num,title,desc,timerMin,tip}],prepTips:[],cookTips:[],servingSuggestions:[],nutrition:{calories,protein,carbs,fat,fiber}}`}],"Professional chef. Return ONLY valid JSON object.",3000),
  getLeftoverRecipes:(leftovers)=>Claude.callJSON([{role:"user",content:`Leftovers: ${leftovers.join(", ")}. Suggest 6 creative recipes. Return JSON array:[{name,emoji,time,diff,cal,idea,ingredients:[],why}]`}],"Zero-waste chef. Return ONLY valid JSON array.",2000),
  getPlannerRecipes:(day,meal,count=20)=>Claude.callJSON([{role:"user",content:`Suggest ${count} ${meal} recipes for ${day}. Diverse Indian regional varieties. Return JSON array:[{name,emoji,time,cal,protein,diff,why,region,tags}]`}],"Meal planning expert. Return ONLY valid JSON array.",2500),
  getGroceryList:(recipe)=>Claude.callJSON([{role:"user",content:`Grocery list for: ${recipe}. Return JSON:{needed:[{item,amount,note,category}],alternatives:[{original,substitute,note}],tips:[string]}`}],"Grocery assistant. Return ONLY valid JSON object.",2000),
  getRecipesFromIngredients:(ingredients)=>Claude.callJSON([{role:"user",content:`I have: ${ingredients.join(", ")}. Suggest 6 recipes. Return JSON array:[{name,emoji,time,diff,cal,protein,tags,usesIngredients:[]}]`}],"Cooking assistant. Return ONLY valid JSON array.",2000),
  getNutrition:(name)=>Claude.callJSON([{role:"user",content:`Nutritional info for ${name} per serving. Return JSON:{calories,protein,carbs,fat,fiber,dietType}`}],"Nutritionist. Return ONLY valid JSON.",800),
};

// ── GROQ CHATBOT SERVICE ──────────────────────────────────────
const Groq = {
  async chat(messages, lang="en"){
    const langMap={en:"Respond in English.",hi:"Hamesha Hindi mein jawab do.",hinglish:"Hinglish mein baat karo — mix of Hindi aur English.",ta:"தமிழில் பதில் சொல்.",te:"తెలుగులో సమాధానం.",bn:"বাংলায় উত্তর দাও।",mr:"मराठीत उत्तर द्या.",gu:"ગુજરાતીમાં જવાબ.",kn:"ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರ.",ml:"മലയാളത്തിൽ.",pa:"ਪੰਜਾਬੀ ਵਿੱਚ."};
    const sys=`You are CookMate AI — expert Indian cooking assistant. Help with recipes, ingredients, nutrition, meal planning. Be friendly, concise, practical. ${langMap[lang]||langMap.en}`;
    if(!CFG.GROQ_KEY){
      // Fallback to Claude if Groq not set
      try{return await Claude.call([{role:"user",content:messages[messages.length-1]?.content||""}],sys,500);}
      catch{return "Chat unavailable. Please set GROQ_KEY.";}
    }
    try{
    const res=await fetch("/api/groq",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${CFG.GROQ_KEY}`},
        body:JSON.stringify({model:CFG.GROQ_MODEL,max_tokens:500,messages:[{role:"system",content:sys},...messages]}),
      });
      const d=await res.json();
      if(d.error) throw new Error(d.error.message);
      return d.choices[0].message.content;
    }catch{return "Couldn't process that. Try again!";}
  },
};

// ── VOICE SERVICE ─────────────────────────────────────────────
const Voice = {
  _v:[],
  init(){if(typeof window==="undefined"||!window.speechSynthesis)return;window.speechSynthesis.onvoiceschanged=()=>{this._v=window.speechSynthesis.getVoices();};this._v=window.speechSynthesis.getVoices()||[];},
  _best(lang){
    const L=LANGS.find(l=>l.code===lang)||LANGS[0];
    const voices=this._v.length?this._v:(window.speechSynthesis?.getVoices()||[]);
    const fem=["female","woman","samantha","victoria","zira","heera","aditi","veena","divya","priya","lekha"];
    for(const code of L.voice){
      const fv=voices.find(v=>v.lang.startsWith(code.split("-")[0])&&fem.some(h=>v.name.toLowerCase().includes(h)));
      if(fv) return fv;
      const av=voices.find(v=>v.lang.startsWith(code.split("-")[0]));
      if(av) return av;
    }
    return voices.find(v=>fem.some(h=>v.name.toLowerCase().includes(h)))||null;
  },
  speak(text,lang="en",onEnd,onStart){
    if(typeof window==="undefined"||!window.speechSynthesis) return false;
    window.speechSynthesis.cancel();
    const utt=new SpeechSynthesisUtterance(text);
    const v=this._best(lang);if(v) utt.voice=v;
    utt.rate=0.88;utt.pitch=1.08;utt.volume=1;
    const L=LANGS.find(l=>l.code===lang)||LANGS[0];utt.lang=L.voice[0];
    if(onStart) onStart();if(onEnd) utt.onend=onEnd;utt.onerror=()=>onEnd&&onEnd();
    window.speechSynthesis.speak(utt);return true;
  },
  stop(){if(typeof window!=="undefined"&&window.speechSynthesis) window.speechSynthesis.cancel();},
};

// ── YOUTUBE SERVICE ───────────────────────────────────────────
const YT_MOCK = [
  {id:"m1",title:"Restaurant Style Guide",channel:"Ranveer Brar",views:"4.2M",duration:"18:32",thumb:"🍳",url:null},
  {id:"m2",title:"Beginner's Easy Recipe",channel:"Hebbars Kitchen",views:"2.8M",duration:"12:14",thumb:"👨‍🍳",url:null},
  {id:"m3",title:"Traditional Authentic Style",channel:"Maa Ki Rasoi",views:"6.1M",duration:"25:45",thumb:"🫕",url:null},
  {id:"m4",title:"Chef's Expert Technique",channel:"MasterChef India",views:"8.4M",duration:"35:20",thumb:"⭐",url:null},
];
async function getVideos(recipeName){
  // Check Supabase cache first
  if(SB.ok()){
    try{
      const cacheKey=recipeName.toLowerCase().trim();
      const res=await fetch(`${CFG.SUPABASE_URL}/rest/v1/video_cache?recipe_name=eq.${encodeURIComponent(cacheKey)}&select=*&limit=1`,{headers:{"apikey":CFG.SUPABASE_KEY,"Authorization":`Bearer ${CFG.SUPABASE_KEY}`}});
      if(res.ok){
        const data=await res.json();
        if(data.length>0&&data[0].videos){
          const allVideos=JSON.parse(data[0].videos);
          const shuffled=[...allVideos].sort(()=>Math.random()-0.5).slice(0,4);
          return{videos:shuffled,source:"live",fromCache:true};
        }
      }
    }catch{}
  }

  // YouTube API call
  if(CFG.YOUTUBE_KEY){
    try{
      const r=await fetch(`/api/youtube?q=${encodeURIComponent(recipeName)}`);
      if(r.ok){
        const d=await r.json();
        if(!d.error&&d.items?.length){
          const allVideos=d.items.map(i=>({id:i.id.videoId,title:i.snippet.title,channel:i.snippet.channelTitle,views:"—",duration:"—",thumb:`https://img.youtube.com/vi/${i.id.videoId}/mqdefault.jpg`,realThumb:true,url:`https://www.youtube.com/watch?v=${i.id.videoId}`}));
          // Save all 50 to Supabase cache
          if(SB.ok()){
            try{
              const cacheKey=recipeName.toLowerCase().trim();
              await fetch(`${CFG.SUPABASE_URL}/rest/v1/video_cache`,{
                method:"POST",
                headers:{"Content-Type":"application/json","apikey":CFG.SUPABASE_KEY,"Authorization":`Bearer ${CFG.SUPABASE_KEY}`,"Prefer":"return=minimal"},
                body:JSON.stringify({recipe_name:cacheKey,videos:JSON.stringify(allVideos),created_at:new Date().toISOString()})
              });
            }catch{}
          }
          const shuffled=[...allVideos].sort(()=>Math.random()-0.5).slice(0,4);
          return{videos:shuffled,source:"live"};
        }
      }
    }catch{}
  }
  return{videos:YT_MOCK,source:"demo"};
}

// ── SMALL COMPONENTS ──────────────────────────────────────────
function Spin({s=20}){return<div className="spin" style={{width:s,height:s,borderRadius:"50%",border:`2px solid ${C.border}`,borderTopColor:C.accent,display:"inline-block"}}/>;}
function Shim({h=72}){return<div className="shimmer" style={{height:h,borderRadius:14,marginBottom:8}}/>;}
function Err({msg,retry}){return<div style={{...ST.card,background:C.redS,borderColor:`${C.red}44`,display:"flex",alignItems:"center",gap:10,marginBottom:10}}><span>⚠️</span><div style={{flex:1,fontSize:13,color:C.red}}>{msg}</div>{retry&&<button onClick={retry} style={mkBtn("red","sm")}>Retry</button>}</div>;}

function HeartBtn({recipe,userId,onToggle}){
  const[fav,setFav]=useState(()=>LS.isFav(recipe.name));
  const toggle=e=>{
    e.stopPropagation();
    const n=LS.toggleFav(recipe);setFav(n);
    if(userId) SB.syncFav(userId,recipe,n).catch(()=>{});
    onToggle&&onToggle(n);
  };
  return<button onClick={toggle} style={{background:fav?"#FF3CAC22":"transparent",border:`1px solid ${fav?"#FF3CAC":C.border}`,borderRadius:20,padding:"5px 9px",cursor:"pointer",fontSize:15,color:fav?"#FF3CAC":C.muted,flexShrink:0,transition:"all 0.2s"}}>{fav?"❤️":"🤍"}</button>;
}

function RecipeCard({recipe,onClick,userId}){
  return<button onClick={onClick} style={{...ST.card,width:"100%",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:12,padding:"13px",marginBottom:8}}>
    <span style={{fontSize:38,flexShrink:0}}>{recipe.emoji||"🍽️"}</span>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontWeight:700,fontSize:14}}>{recipe.name}</div>
      <div style={{display:"flex",gap:8,marginTop:3,flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:C.muted}}>⏱ {recipe.time||"30 min"}</span>
        <span style={{fontSize:11,color:C.muted}}>📊 {recipe.diff||"Easy"}</span>
      </div>
      <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
        {recipe.cal&&<span style={mkPill()}>🔥 {recipe.cal} kcal</span>}
        {recipe.protein&&<span style={mkPill(C.a2)}>💪 {recipe.protein}</span>}
        {recipe.source==="db"&&<span style={mkPill(C.ok)}>⚡ DB</span>}
      </div>
    </div>
    <HeartBtn recipe={recipe} userId={userId}/>
  </button>;
}

// ── YOUTUBE SECTION ───────────────────────────────────────────
function YouTubeSection({recipeName,t}){
  const[videos,setVideos]=useState([]);
  const[loading,setLoading]=useState(true);
  const[source,setSource]=useState("");
  const[playing,setPlaying]=useState(null);
  const[embedError,setEmbedError]=useState({});
  const[fromCache,setFromCache]=useState(false);

  const loadVideos=useCallback(async()=>{
    setLoading(true);setPlaying(null);setEmbedError({});
    try{
      const r=await getVideos(recipeName);
      setVideos(r.videos);setSource(r.source);setFromCache(r.fromCache||false);
    }catch{setVideos(YT_MOCK);setSource("demo");}
    setLoading(false);
  },[recipeName]);

  useEffect(()=>{loadVideos();},[loadVideos]);

  return<div style={{marginBottom:16}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
      <span style={{fontSize:14,fontWeight:700}}>📺 {t.videos}</span>
      <span style={mkTag(source==="live"?C.ok:C.warn)}>{source==="live"?t.liveMode:t.demoMode}</span>
      {fromCache&&<span style={mkTag(C.a2)}>⚡ Cached</span>}
      <button onClick={loadVideos} disabled={loading} style={{...mkBtn("ghost","sm"),borderRadius:20,marginLeft:"auto"}}>
        {loading?<Spin s={12}/>:"↻ Refresh"}
      </button>
    </div>
    {playing&&!embedError[playing]&&<div style={{marginBottom:12,borderRadius:14,overflow:"hidden",background:"#000",position:"relative"}}>
      <iframe src={`https://www.youtube.com/embed/${playing}?autoplay=1`} width="100%" height="210" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{display:"block"}}/>
      <button onClick={()=>setPlaying(null)} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.75)",border:"none",color:"#fff",borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
    </div>}
    {loading&&[1,2,3,4].map(i=><Shim key={i} h={76}/>)}
    {!loading&&videos.map((v,i)=>{
      const canEmbed=v.id&&!v.id.startsWith("mock");
      const hasError=embedError[v.id];
      return<div key={i} className="fade-in" style={{background:C.bg,border:`1px solid ${playing===v.id?C.accent:C.border}`,borderRadius:14,marginBottom:8,display:"flex",alignItems:"center",gap:12,padding:"10px 12px"}}>
        <div style={{width:68,height:48,borderRadius:8,background:C.card,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
          {v.realThumb?<img src={v.thumb} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontSize:22}}>{v.thumb||"🎬"}</span>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:600,fontSize:12,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{v.title}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{v.channel}</div>
          {hasError&&<div style={{fontSize:10,color:C.warn,marginTop:2}}>⚠️ Embed not allowed</div>}
        </div>
        {canEmbed&&!hasError?(
          <button onClick={()=>setPlaying(playing===v.id?null:v.id)} style={{width:34,height:34,borderRadius:"50%",background:playing===v.id?C.accent:"#FF0000",border:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
            <span style={{color:"#fff",fontSize:10,marginLeft:playing===v.id?0:2}}>{playing===v.id?"⏸":"▶"}</span>
          </button>
        ):(
          <a href={v.url||`https://www.youtube.com/results?search_query=${encodeURIComponent(recipeName+" recipe")}`} target="_blank" rel="noreferrer" style={{width:34,height:34,borderRadius:"50%",background:"#FF0000",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,textDecoration:"none",fontSize:10,color:"#fff",paddingLeft:2}}>▶</a>
        )}
      </div>;
    })}
    {!CFG.YOUTUBE_KEY&&<div style={{...ST.card,background:C.a2S,borderColor:`${C.a2}44`,fontSize:12,color:C.a2,textAlign:"center",padding:"10px"}}>
      💡 Set YOUTUBE_KEY for real videos
    </div>}
  </div>;
}
// ── FLOATING GROQ CHATBOT ─────────────────────────────────────
function FloatingChat({lang}){
  const[open,setOpen]=useState(false);
  const[full,setFull]=useState(false);
  const[msgs,setMsgs]=useState([{role:"assistant",content:"Namaste! 👋 I'm your CookMate AI assistant. Ask me anything about cooking, recipes, or nutrition!"}]);
  const[inp,setInp]=useState("");
  const[typing,setTyping]=useState(false);
  const endRef=useRef();
  const t=TR[lang]||TR.en;

  useEffect(()=>{if(open&&endRef.current) endRef.current.scrollIntoView({behavior:"smooth"});},[msgs,open]);

  const send=async()=>{
    const text=inp.trim();if(!text||typing) return;
    setInp("");
    const userMsg={role:"user",content:text};
    setMsgs(p=>[...p,userMsg]);
    setTyping(true);
    try{
      const history=[...msgs,userMsg].slice(-8).map(m=>({role:m.role==="assistant"?"assistant":"user",content:m.content}));
      const reply=await Groq.chat(history,lang);
      setMsgs(p=>[...p,{role:"assistant",content:reply}]);
    }catch{setMsgs(p=>[...p,{role:"assistant",content:"Sorry, try again!"}]);}
    setTyping(false);
  };

  const formatMsg=(text)=>text
    .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
    .replace(/^### (.*)/gm,"<h4 style='margin:6px 0 3px;font-size:13px'>$1</h4>")
    .replace(/^## (.*)/gm,"<h3 style='margin:6px 0 3px;font-size:14px'>$1</h3>")
    .replace(/^# (.*)/gm,"<h2 style='margin:6px 0 3px;font-size:15px'>$1</h2>")
    .replace(/^\* (.*)/gm,"<li style='margin-left:14px'>$1</li>")
    .replace(/^- (.*)/gm,"<li style='margin-left:14px'>$1</li>")
    .replace(/\n/g,"<br/>");

  return<>
    <button onClick={()=>setOpen(p=>!p)} className="bounce-in" style={{position:"fixed",bottom:76,right:16,zIndex:300,width:52,height:52,borderRadius:"50%",border:"none",cursor:"pointer",background:grad,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(255,107,53,0.45)",fontSize:22,transition:"transform 0.2s"}}>
      {open?"✕":"💬"}
    </button>
    {open&&<div className="slide-up" style={{position:"fixed",bottom:full?0:138,right:full?0:10,left:full?0:"auto",top:full?0:"auto",zIndex:299,width:full?"100%":"308px",background:C.card,border:`1px solid ${C.border}`,borderRadius:full?0:20,boxShadow:"0 8px 40px rgba(0,0,0,0.5)",display:"flex",flexDirection:"column",overflow:"hidden",maxHeight:full?"100vh":"58vh"}}>
      <div style={{padding:"11px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,background:`linear-gradient(135deg,${C.gA}15,${C.gB}15)`}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🍳</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13,color:C.txt}}>{t.chatTitle}</div>
         <div style={{fontSize:10,color:C.ok}}>● Online</div> 
        </div>
        <button onClick={()=>setFull(p=>!p)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,padding:"4px"}}>{full?"⊡":"⊞"}</button>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,padding:"4px"}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px",display:"flex",flexDirection:"column",gap:8}}>
        {msgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
          {m.role==="user"
            ?<div className="bubble-user">{m.content}</div>
            :<div className="bubble-ai" dangerouslySetInnerHTML={{__html:formatMsg(m.content)}}/>}
        </div>)}
        {typing&&<div style={{display:"flex",justifyContent:"flex-start"}}>
          <div className="bubble-ai" style={{display:"flex",gap:4,alignItems:"center"}}>
            {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.accent,animation:"pulse 1s ease infinite",animationDelay:`${i*0.2}s`}}/>)}
          </div>
        </div>}
        <div ref={endRef}/>
      </div>
      <div style={{padding:"9px",borderTop:`1px solid ${C.border}`,display:"flex",gap:6}}>
        <input style={{...ST.inp,flex:1,fontSize:12,padding:"8px 12px",borderRadius:20}} placeholder={t.chatPlaceholder} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}/>
        <button onClick={send} disabled={typing||!inp.trim()} style={{...mkBtn("primary"),padding:"8px 12px",borderRadius:20,fontSize:12,opacity:!inp.trim()?0.5:1}}>
          {typing?<Spin s={13}/>:"➤"}
        </button>
      </div>
    </div>}
  </>;
}

// ── AUTH SCREEN ───────────────────────────────────────────────
function AuthScreen({onLogin}){
  const[mode,setMode]=useState("landing");
  const[email,setEmail]=useState("");
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const[otpSent,setOtpSent]=useState(false);

  const googleLogin=async()=>{
    setLoading(true);setErr("");
    try{
    const{error}=await supabase.auth.signInWithOAuth({
  provider:"google",
  options:{redirectTo:"https://cookmate-ai-xi.vercel.app"}
}); 
      if(error) throw error;
    }catch(e){setErr(e.message);setLoading(false);}
  };

  const sendEmailOTP=async()=>{
    if(!email.includes("@")){setErr("Valid email daalo");return;}
    setLoading(true);setErr("");
    try{
      const{error}=await supabase.auth.signInWithOtp({email});
      if(error) throw error;
      setOtpSent(true);
    }catch(e){setErr(e.message);}
    setLoading(false);
  };

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){
        onLogin({name:session.user.user_metadata?.full_name||session.user.email?.split("@")[0]||"Chef",email:session.user.email,id:session.user.id,method:"supabase"});
      }
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user){
        onLogin({name:session.user.user_metadata?.full_name||session.user.email?.split("@")[0]||"Chef",email:session.user.email,id:session.user.id,method:"supabase"});
      }
    });
    return()=>subscription.unsubscribe();
  },[]);

  return<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{width:"100%",maxWidth:360}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:60,marginBottom:8}}>🍳</div>
        <div style={{...ST.logo,fontSize:28,display:"inline-block"}}>CookMate AI</div>
        <p style={{color:C.muted,marginTop:8,fontSize:14}}>Your AI Kitchen Assistant</p>
      </div>
      {err&&<Err msg={err}/>}
      {mode==="landing"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
        <button onClick={googleLogin} disabled={loading} style={{...mkBtn("out","lg"),justifyContent:"center",gap:12}}>
          {loading?<Spin/>:<span style={{fontSize:20}}>🔵</span>} Continue with Google
        </button>
        <button onClick={()=>{setMode("email");setErr("");}} style={{...mkBtn("out","lg"),justifyContent:"center",gap:12}}>
          <span style={{fontSize:20}}>✉️</span> Login with Email OTP
        </button>
        <p style={{textAlign:"center",fontSize:11,color:C.sub,marginTop:8}}>Free forever · No spam</p>
      </div>}
      {mode==="email"&&!otpSent&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
        <p style={{color:C.muted,fontSize:14}}>Email pe OTP aayega</p>
        <input style={ST.inp} placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} type="email"/>
        <button onClick={sendEmailOTP} disabled={loading||!email.includes("@")} style={{...mkBtn("primary","lg"),opacity:!email.includes("@")?.5:1}}>
          {loading?"Sending...":"Send OTP →"}
        </button>
        <button onClick={()=>setMode("landing")} style={{...mkBtn("ghost"),borderRadius:12}}>← Back</button>
      </div>}
      {otpSent&&<div style={{textAlign:"center",padding:20}}>
        <div style={{fontSize:48,marginBottom:12}}>📧</div>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>OTP bhej diya!</h3>
        <p style={{color:C.muted,fontSize:13}}>{email} pe check karo — link pe click karo</p>
        <button onClick={()=>{setOtpSent(false);setMode("landing");}} style={{...mkBtn("ghost"),margin:"16px auto 0"}}>← Back</button>
      </div>}
    </div>
  </div>;
}
// ── HOME SCREEN ───────────────────────────────────────────────
function HomeScreen({user,onNav,onRec,t,lang,recents}){
  const[picks,setPicks]=useState([]);
  const[loading,setLoading]=useState(true);
  const[filter,setFilter]=useState("All");
  const[err,setErr]=useState("");

  const loadPicks=useCallback(async()=>{
    setLoading(true);setErr("");
    try{const d=await Claude.getAIPicks(20);if(Array.isArray(d)&&d.length>0) setPicks(d);else setErr("Could not load picks.");}
    catch(e){setErr(e.message||"Failed.");}
    setLoading(false);
  },[]);

  useEffect(()=>{loadPicks();},[]);

  const CATS=["All","Breakfast","Lunch","Dinner","Snacks"];
  const filtered=filter==="All"?picks:picks.filter(r=>r.category===filter);
  const openRec=r=>{LS.addRecent(r);onRec(r);};

  return<div style={ST.scr}>
    <div style={{marginBottom:18}}>
      <div style={{fontSize:12,color:C.muted,marginBottom:3}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
      <h1 style={{fontSize:22,fontWeight:800,lineHeight:1.2}}>Good day, {user.name}! 👋<br/>
        <span style={{background:grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>What are we cooking?</span>
      </h1>
    </div>
    <button onClick={()=>onNav("scan")} style={{width:"100%",padding:"16px 18px",borderRadius:18,border:"none",cursor:"pointer",background:grad,display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
      <span style={{fontSize:30}}>📷</span>
      <div style={{textAlign:"left"}}>
        <div style={{color:"#fff",fontWeight:800,fontSize:16}}>Scan Ingredients</div>
        <div style={{color:"rgba(255,255,255,0.75)",fontSize:12}}>{SB.ok()?"DB search first → AI fallback":"AI detects what you have"}</div>
      </div>
      <span style={{marginLeft:"auto",color:"rgba(255,255,255,0.8)",fontSize:22}}>→</span>
    </button>
    <div style={{display:"flex",gap:8,marginBottom:20}}>
      {[{ic:"📅",lb:t.mealPlanner,sc:"planner",col:C.a2},{ic:"🥘",lb:t.leftoverRescue,sc:"leftover",col:C.warn},{ic:"🛒",lb:t.smartGrocery,sc:"grocery",col:C.ok}].map(({ic,lb,sc,col})=>(
        <button key={sc} onClick={()=>onNav(sc)} style={{flex:1,background:C.card,border:`1px solid ${col}44`,borderRadius:16,padding:"14px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
          <span style={{fontSize:26}}>{ic}</span>
          <span style={{fontSize:10,fontWeight:600,color:C.muted,textAlign:"center",lineHeight:1.3}}>{lb}</span>
        </button>
      ))}
    </div>
    {recents.length>0&&<div style={{marginBottom:20}}>
      <h2 style={{margin:"0 0 10px",fontSize:15,fontWeight:700}}>🕐 {t.recentRecipes}</h2>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
        {recents.slice(0,10).map((r,i)=><button key={i} onClick={()=>openRec(r)} style={{flexShrink:0,width:108,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:10,cursor:"pointer",textAlign:"left"}}>
          <div style={{fontSize:26,marginBottom:4}}>{r.emoji||"🍽️"}</div>
      <div style={{fontWeight:700,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:C.txt}}>{r.name}</div>
          <div style={{fontSize:10,color:C.muted,marginTop:2}}>{r.time||"30 min"}</div>
        </button>)}
      </div>
    </div>}
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h2 style={{margin:0,fontSize:15,fontWeight:700}}>✨ {t.aiPicks}</h2>
        <button onClick={loadPicks} disabled={loading} style={{...mkBtn("ghost","sm"),borderRadius:20,fontSize:11}}>{loading?<Spin s={12}/>:"↻"}</button>
      </div>
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:10}}>
        {CATS.map(cat=><button key={cat} onClick={()=>setFilter(cat)} style={{flexShrink:0,padding:"6px 12px",borderRadius:20,border:`1px solid ${filter===cat?C.accent:C.border}`,background:filter===cat?C.accentS:C.card,color:filter===cat?C.accent:C.muted,cursor:"pointer",fontWeight:600,fontSize:11}}>{cat}</button>)}
      </div>
      {err&&<Err msg={err} retry={loadPicks}/>}
      {loading?[1,2,3,4].map(i=><Shim key={i}/>)
      :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {filtered.slice(0,20).map((r,i)=><button key={i} onClick={()=>openRec({name:r.name,emoji:r.emoji||"🍽️",time:r.time||"30 min",diff:r.diff||"Easy",cal:r.cal||320,protein:r.protein||"12g",tags:[r.category||"AI Pick"]})} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:11,cursor:"pointer",textAlign:"left"}} className="fade-in">
          <div style={{fontSize:26,marginBottom:5}}>{r.emoji||"🍽️"}</div>
          <div style={{fontWeight:700,fontSize:12,lineHeight:1.3}}>{r.name}</div>
          <div style={{fontSize:10,color:C.muted,marginTop:2}}>{r.time}</div>
          {r.category&&<span style={{...mkTag(C.a2),marginTop:5,fontSize:10}}>{r.category}</span>}
        </button>)}
      </div>}
    </div>
  </div>;
}

// ── SCAN SCREEN — DB first, AI fallback ───────────────────────
function ScanScreen({onRec,t,lang,userId}){
  const[step,setStep]=useState("cap");
  const[ings,setIngs]=useState([]);
  const[recs,setRecs]=useState([]);
  const[loading,setLoading]=useState(false);
  const[scanning,setScanning]=useState(false);
  const[mi,setMi]=useState("");
  const[preview,setPreview]=useState(null);
  const[err,setErr]=useState("");
  const[status,setStatus]=useState("");
  const fref=useRef();

  const handleFile=async e=>{
    const file=e.target.files?.[0];if(!file) return;
    const url=URL.createObjectURL(file);setPreview(url);
    setScanning(true);setLoading(true);setErr("");
    try{
      const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const result=await Claude.detectIngredients(base64,file.type||"image/jpeg");
      if(result?.ingredients?.length>0){setIngs(result.ingredients.map(i=>`${i.emoji||"🥗"} ${i.name}`));setStep("det");}
      else{setErr(result?.notes||"No food detected. Add manually.");setStep("det");}
    }catch{setErr("Image analysis failed. Add ingredients manually.");}
    setScanning(false);setLoading(false);
    if(fref.current) fref.current.value="";
  };

  const addM=()=>{if(!mi.trim()) return;setIngs(p=>[...p,"🥗 "+mi.trim()]);setMi("");};
  const remI=i=>setIngs(p=>p.filter((_,j)=>j!==i));

 const genRec=async()=>{
    setLoading(true);setErr("");
    const names=ings.map(i=>i.replace(/^[^\w\u0900-\u097F]*/,"").trim()).filter(Boolean);
    // Step 1: DB search
    setStatus("🔍 Searching database...");
    let dbRes=[];
    if(SB.ok()){dbRes=await SB.searchByIngredients(names);}

   if(dbRes.length>=1){
      setStatus("⚡ Found in database!");
      setRecs(dbRes);setStep("rec");
    } else {
      // Step 2: AI fallback
      setStatus("🤖 AI generating recipes...");
      try{
        const d=await Claude.getRecipesFromIngredients(names);
        if(Array.isArray(d)&&d.length>0){
          const aiRecs=d.map(r=>({...r,source:"ai"}));
          setRecs([...dbRes,...aiRecs]);setStep("rec");
          if(SB.ok()) aiRecs.forEach(r=>SB.saveRecipe(r).catch(()=>{}));
        } else setErr("No recipes found. Try different ingredients.");
      }catch(e){setErr(e.message||"Generation failed.");}
    }
    setStatus("");setLoading(false);
  };

  const openRec=r=>{LS.addRecent(r);onRec(r);};

  return<div style={ST.scr}>
    <h2 style={{fontSize:18,fontWeight:800,marginBottom:3}}>📷 {t.scanIngredients}</h2>
    <p style={{color:C.muted,fontSize:13,marginBottom:14}}>{SB.ok()?"DB search first → AI fallback":"Claude Vision → AI recipes"}</p>
    {step==="cap"&&!scanning&&<>
      <div style={{...ST.card,textAlign:"center",padding:"32px 16px",border:`2px dashed ${C.border}`,cursor:"pointer",marginBottom:10}} onClick={()=>fref.current?.click()}>
        <div style={{fontSize:44,marginBottom:10}}>📸</div>
        <div style={{fontWeight:700,fontSize:15}}>{t.tapPhoto}</div>
        <div style={{color:C.muted,fontSize:12,marginTop:4}}>Claude Vision only reports what it sees</div>
      </div>
      <input ref={fref} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" style={{display:"none"}} onChange={handleFile}/>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <button onClick={()=>fref.current?.click()} style={{...mkBtn("out"),flex:1,borderRadius:12,fontSize:13}}>📁 {t.uploadPhoto}</button>
      </div>
      <div style={{...ST.card,padding:"10px 13px"}}>
        <p style={{color:C.muted,fontSize:12,marginBottom:7}}>Or type ingredients manually:</p>
        <div style={{display:"flex",gap:7}}>
          <input style={{...ST.inp,flex:1,fontSize:13}} placeholder={t.addMore} value={mi} onChange={e=>setMi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addM()}/>
          <button onClick={addM} style={{...mkBtn("primary"),padding:"10px 13px",borderRadius:10}}>+</button>
        </div>
        {ings.length>0&&<>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
            {ings.map((g,i)=><span key={i} onClick={()=>remI(i)} style={{...mkTag(C.ok),cursor:"pointer"}}>{g} ×</span>)}
          </div>
          <button onClick={genRec} disabled={loading} style={{...mkBtn("primary"),width:"100%",marginTop:10,borderRadius:10,fontSize:13}}>
            {loading?<><Spin s={14}/> {status||"Loading..."}</>:"✨ Find Recipes"}
          </button>
        </>}
      </div>
    </>}
    {scanning&&<div style={{...ST.card,overflow:"hidden",position:"relative",padding:0,marginBottom:14}}>
      {preview?<img src={preview} style={{width:"100%",height:220,objectFit:"cover",display:"block"}} alt=""/>
      :<div style={{width:"100%",height:220,background:`linear-gradient(135deg,${C.card},#0A0D14)`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:52,opacity:.4}}>🥗</span></div>}
      <div style={{position:"absolute",left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${C.ok},transparent)`,animation:"scanLine 1.5s linear infinite",top:"0%"}}/>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
        <Spin s={36}/><div style={{color:C.ok,fontWeight:700,fontSize:13,background:"rgba(0,0,0,0.7)",padding:"6px 16px",borderRadius:20}}>{t.scanning}</div>
      </div>
    </div>}
    {step==="det"&&<>
      {preview&&<div style={{...ST.card,padding:6,marginBottom:10}}><img src={preview} style={{width:"100%",maxHeight:140,objectFit:"cover",borderRadius:10,display:"block"}} alt=""/></div>}
      {err&&<Err msg={err}/>}
      <div style={{...ST.card,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <span style={mkTag(C.ok)}>✓ Detected</span>
          <span style={{fontSize:12,color:C.muted}}>{ings.length} items</span>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {ings.map((g,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:5,background:C.bg,border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 10px",fontSize:12}}>
            {g}<button onClick={()=>remI(i)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,padding:0}}>×</button>
          </div>)}
        </div>
        <div style={{display:"flex",gap:7,marginTop:10}}>
          <input style={{...ST.inp,flex:1,fontSize:12}} placeholder={t.addMore} value={mi} onChange={e=>setMi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addM()}/>
          <button onClick={addM} style={{...mkBtn("primary"),padding:"9px 11px",borderRadius:10}}>+</button>
        </div>
      </div>
      {SB.ok()&&<div style={{...ST.card,background:C.a2S,borderColor:`${C.a2}44`,marginBottom:10,fontSize:12,color:C.a2}}>⚡ Will search database first → AI fallback if no match</div>}
      <button onClick={genRec} disabled={loading||ings.length===0} style={{...mkBtn("primary"),width:"100%",opacity:ings.length===0?.5:1}}>
        {loading?<><Spin s={16}/> {status||"Loading..."}</>:"✨ Find Recipes"}
      </button>
      <button onClick={()=>{setStep("cap");setIngs([]);setPreview(null);setErr("");}} style={{...mkBtn("ghost"),width:"100%",marginTop:7,fontSize:13}}>← {t.rescan}</button>
    </>}
    {step==="rec"&&<>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <span style={{fontSize:13,color:C.muted}}>{recs.length} recipes found</span>
        {recs.some(r=>r.source==="db")&&<span style={mkTag(C.ok)}>⚡ DB Match</span>}
        {recs.some(r=>r.source==="ai")&&<span style={mkTag(C.accent)}>🤖 AI</span>}
      </div>
      {err&&<Err msg={err}/>}
      {recs.map((r,i)=><RecipeCard key={i} recipe={r} userId={userId} onClick={()=>openRec(r)}/>)}
      <button onClick={()=>{setStep("cap");setRecs([]);setIngs([]);setPreview(null);setErr("");}} style={{...mkBtn("ghost"),width:"100%",marginTop:4,fontSize:13}}>← {t.rescan}</button>
    </>}
  </div>;
}

// ── RECIPE DETAIL ─────────────────────────────────────────────
function RecipeDetail({recipe,onBack,t,lang,userId}){
  const[tab,setTab]=useState("info");
  const[mode,setMode]=useState("detail");
  const[serv,setServ]=useState(2);
  const[detail,setDetail]=useState(null);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const[cur,setCur]=useState(0);
  const[tLeft,setTLeft]=useState(0);
  const[speaking,setSpeaking]=useState(false);
  const tRef=useRef();
  useEffect(()=>()=>{if(tRef.current) clearInterval(tRef.current);Voice.stop();},[]);

  const loadDetail=async s=>{
    setLoading(true);setErr("");
    try{
      const d=await Claude.getFullRecipe(recipe.name,s);
      if(d?.steps?.length>0){
        setDetail(d);LS.addRecent(recipe);
        if(SB.ok()) SB.saveRecipe(d).catch(()=>{});
        setMode("cooking");setCur(0);
      } else setErr("Could not load steps. Try again.");
    }catch(e){setErr(e.message||"Failed.");}
    setLoading(false);
  };
  const startTimer=m=>{if(tRef.current) clearInterval(tRef.current);setTLeft(m*60);tRef.current=setInterval(()=>setTLeft(p=>{if(p<=1){clearInterval(tRef.current);return 0;}return p-1;}),1000);};
  const speak=text=>{if(speaking){Voice.stop();setSpeaking(false);return;}Voice.speak(text,lang,()=>setSpeaking(false),()=>setSpeaking(true));};

  if(mode==="detail") return<div style={ST.scr}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
      <button onClick={onBack} style={{...mkBtn("ghost","sm"),borderRadius:10}}>← {t.back}</button>
      <HeartBtn recipe={recipe} userId={userId}/>
    </div>
    <div style={{textAlign:"center",marginBottom:14}}>
      <div style={{fontSize:64,marginBottom:8}}>{recipe.emoji||"🍽️"}</div>
      <h1 style={{fontSize:21,fontWeight:800,marginBottom:8}}>{recipe.name}</h1>
      <div style={{display:"flex",justifyContent:"center",gap:7,flexWrap:"wrap"}}>
        <span style={mkTag(C.accent)}>⏱ {recipe.time||"30 min"}</span>
        <span style={mkTag(C.a2)}>📊 {recipe.diff||"Easy"}</span>
        {(recipe.tags||[]).slice(0,2).map((tg,i)=><span key={i} style={mkTag(C.ok)}>{tg}</span>)}
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:14}}>
      {[{lb:t.calories,v:recipe.cal||320,u:"kcal",ic:"🔥"},{lb:t.protein,v:recipe.protein||"15g",u:"",ic:"💪"},{lb:"Prep",v:"10",u:"min",ic:"⏰"},{lb:"Serves",v:serv,u:"",ic:"👥"}].map((n,i)=><div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"9px 5px",textAlign:"center"}}>
        <div style={{fontSize:17}}>{n.ic}</div>
        <div style={{fontWeight:700,fontSize:13,marginTop:2}}>{n.v}{n.u}</div>
        <div style={{fontSize:10,color:C.muted}}>{n.lb}</div>
      </div>)}
    </div>
    <div style={{display:"flex",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:3,marginBottom:14}}>
      {[["info","ℹ️ Info"],["videos","📺 Videos"]].map(([k,lb])=><button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"8px 0",borderRadius:9,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,background:tab===k?grad:"transparent",color:tab===k?"#fff":C.muted}}>{lb}</button>)}
    </div>
    {tab==="info"&&<div style={{...ST.card,marginBottom:10,fontSize:13,color:C.muted,lineHeight:1.7}}>{recipe.description||`${recipe.name} — ${recipe.diff||"Easy"} recipe. Tap Start Cooking for full step-by-step guide.`}</div>}
    {tab==="videos"&&<YouTubeSection recipeName={recipe.name} t={t}/>}
    <button onClick={()=>setMode("serving")} style={{...mkBtn("primary","lg"),width:"100%"}}>🍳 {t.startCooking}</button>
  </div>;

  if(mode==="serving") return<div style={ST.scr}>
    <button onClick={()=>setMode("detail")} style={{...mkBtn("ghost","sm"),borderRadius:10,marginBottom:14}}>← {t.back}</button>
    <div style={{textAlign:"center",padding:"10px 0 20px"}}>
      <div style={{fontSize:50,marginBottom:10}}>{recipe.emoji||"🍽️"}</div>
      <h2 style={{fontSize:19,fontWeight:800,marginBottom:5}}>{t.howMany}</h2>
      <p style={{color:C.muted,fontSize:13}}>AI adjusts all quantities automatically</p>
    </div>
    {err&&<Err msg={err} retry={()=>loadDetail(serv)}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
      {[1,2,4,6].map(n=><button key={n} onClick={()=>setServ(n)} style={{padding:"17px 0",borderRadius:16,border:`2px solid ${serv===n?C.accent:C.border}`,background:serv===n?C.accentS:C.card,cursor:"pointer",fontWeight:700,fontSize:18,color:serv===n?C.accent:C.txt}}>
        {n===6?"6+":n}<br/><span style={{fontSize:11,fontWeight:400,color:C.muted}}>{n===1?"Person":"Persons"}</span>
      </button>)}
    </div>
    <button onClick={()=>loadDetail(serv)} disabled={loading} style={{...mkBtn("primary","lg"),width:"100%"}}>
      {loading?<><Spin s={18}/> Preparing recipe...</>:`${t.cookFor} ${serv===6?"6+":serv} ${t.people} →`}
    </button>
  </div>;

  if(mode==="cooking"&&detail){
    const c=detail.steps[cur];const prog=((cur+1)/detail.steps.length)*100;
    return<div style={ST.scr}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <button onClick={()=>cur>0?setCur(p=>p-1):setMode("detail")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22,padding:"2px 4px"}}>‹</button>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:3}}>{recipe.name} · {serv} {t.people}</div>
          <div style={{height:5,background:C.card,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${prog}%`,background:grad,borderRadius:3,transition:"width 0.4s"}}/></div>
        </div>
        <span style={{fontSize:12,color:C.muted,fontWeight:600,flexShrink:0}}>{cur+1}/{detail.steps.length}</span>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:18}}>×</button>
      </div>
      {cur===0&&detail.ingredients?.length>0&&<div style={{...ST.card,marginBottom:12,borderLeft:`3px solid ${C.a2}`}} className="slide-up">
        <div style={{fontWeight:700,fontSize:12,color:C.a2,marginBottom:8}}>🛒 {t.ingredients} ({serv} {t.people})</div>
        {detail.ingredients.map((ing,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4,paddingBottom:4,borderBottom:i<detail.ingredients.length-1?`1px solid ${C.border}`:"none"}}>
          <span style={{color:C.txt}}>{ing.item}</span>
          <span style={{color:C.accent,fontWeight:700}}>{ing.amount} {ing.unit||""}</span>
        </div>)}
      </div>}
      <div style={{...ST.card,borderLeft:`4px solid ${C.accent}`,padding:"16px 14px",marginBottom:12}} className="slide-up">
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={mkTag(C.accent)}>Step {c.num||cur+1}</span>
          {c.timerMin&&<span style={mkTag(C.warn)}>⏱ {c.timerMin} min</span>}
        </div>
        <h2 style={{fontSize:17,fontWeight:800,margin:"0 0 7px"}}>{c.title}</h2>
        <p style={{color:C.muted,lineHeight:1.7,margin:0,fontSize:13}}>{c.desc}</p>
        {c.tip&&<div style={{marginTop:10,padding:"7px 10px",background:C.a2S,borderRadius:8,fontSize:11,color:C.a2}}>💡 {c.tip}</div>}
      </div>
      {c.timerMin&&<div style={{...ST.card,textAlign:"center",marginBottom:10}}>
        {tLeft>0?<><div style={{fontSize:36,fontWeight:800,color:tLeft<30?C.red:C.accent,fontVariantNumeric:"tabular-nums"}}>{String(Math.floor(tLeft/60)).padStart(2,"0")}:{String(tLeft%60).padStart(2,"0")}</div>
          <div style={{height:3,background:C.border,borderRadius:2,marginTop:8,overflow:"hidden"}}><div style={{height:"100%",width:`${(tLeft/(c.timerMin*60))*100}%`,background:tLeft<30?C.red:grad,transition:"width 1s",borderRadius:2}}/></div></>
        :<button onClick={()=>startTimer(c.timerMin)} style={{...mkBtn("ghost"),margin:"0 auto"}}>▶ Start {c.timerMin}-min Timer</button>}
      </div>}
      <button onClick={()=>speak(`Step ${c.num||cur+1}: ${c.title}. ${c.desc}`)} style={{...mkBtn("out"),width:"100%",marginBottom:8}}>{speaking?"🔊 Speaking...":"🎙 "+t.readStep}</button>
      <div style={{display:"flex",gap:8}}>
        {cur>0&&<button onClick={()=>{setCur(p=>p-1);Voice.stop();setSpeaking(false);}} style={{...mkBtn("out"),flex:1}}>{t.prevStep}</button>}
        {cur<detail.steps.length-1
          ?<button onClick={()=>{setCur(p=>p+1);Voice.stop();setSpeaking(false);if(tRef.current)clearInterval(tRef.current);setTLeft(0);}} style={{...mkBtn("primary"),flex:2}}>{t.nextStep}</button>
          :<button onClick={()=>{LS.addRecent({...recipe,cookedAt:Date.now()});onBack();}} style={{...mkBtn("primary"),flex:2}}>{t.done}</button>}
      </div>
      {cur===detail.steps.length-1&&detail.cookTips?.length>0&&<div style={{...ST.card,marginTop:12,background:C.okS,borderColor:`${C.ok}44`}}>
        <div style={{fontWeight:700,fontSize:12,color:C.ok,marginBottom:6}}>💡 Chef's Tips</div>
        {detail.cookTips.map((tip,i)=><div key={i} style={{fontSize:12,color:C.muted,marginBottom:3}}>• {tip}</div>)}
      </div>}
    </div>;
  }
  return<div style={{...ST.scr,textAlign:"center",paddingTop:60}}><Spin s={36}/><p style={{color:C.muted,marginTop:12,fontSize:14}}>Preparing recipe...</p></div>;
}

// ── PLANNER ───────────────────────────────────────────────────
function PlannerScreen({onRec,t,lang,userId}){
  const[day,setDay]=useState("Monday");
  const[meal,setMeal]=useState("Breakfast");
  const[plan,setPlan]=useState([]);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const FD=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const MEALS=["Breakfast","Lunch","Dinner","Snacks"];
  const ICONS={Breakfast:"🌅",Lunch:"☀️",Dinner:"🌙",Snacks:"🍿"};
  const gen=async()=>{
  setLoading(true);setErr("");
  try{
    // Supabase pehle
    const sbRes=await fetch("/api/supabase",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({type:"category",category:meal})
    });
    const sbData=await sbRes.json();
    if(Array.isArray(sbData)&&sbData.length>=3){
      setPlan(sbData.map(r=>({...r,source:"db",emoji:r.emoji||"🍽️",time:r.minutes?r.minutes+" min":"30 min",diff:r.difficulty||"Medium",cal:r.nutrition?.calories||320,protein:r.nutrition?.protein||"12g"})));
    } else {
      // Claude fallback
      const d=await Claude.getPlannerRecipes(day,meal,20);
      if(Array.isArray(d)&&d.length>0) setPlan(d);
      else setErr("Try again.");
    }
  }catch(e){setErr(e.message||"Failed.");}
  setLoading(false);
};
  return<div style={ST.scr}>
    <h2 style={{fontSize:18,fontWeight:800,marginBottom:3}}>📅 {t.mealPlanner}</h2>
    <p style={{color:C.muted,fontSize:13,marginBottom:14}}>20 recipes per request · Regional Indian variety</p>
    <p style={{fontSize:12,color:C.muted,marginBottom:6}}>{t.selectDay}</p>
    <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:12}}>
      {DAYS.map((d,i)=><button key={d} onClick={()=>setDay(FD[i])} style={{flexShrink:0,padding:"7px 11px",borderRadius:20,border:`1px solid ${day===FD[i]?C.accent:C.border}`,background:day===FD[i]?C.accentS:C.card,color:day===FD[i]?C.accent:C.muted,cursor:"pointer",fontWeight:600,fontSize:12}}>{d}</button>)}
    </div>
    <p style={{fontSize:12,color:C.muted,marginBottom:6}}>{t.mealType}</p>
    <div style={{display:"flex",gap:6,marginBottom:14}}>
      {MEALS.map(m=><button key={m} onClick={()=>setMeal(m)} style={{flex:1,padding:"9px 0",borderRadius:12,border:`1px solid ${meal===m?C.accent:C.border}`,background:meal===m?C.accentS:C.card,color:meal===m?C.accent:C.muted,cursor:"pointer",fontWeight:600,fontSize:11,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
        <span style={{fontSize:15}}>{ICONS[m]}</span>{m}
      </button>)}
    </div>
    <button onClick={gen} disabled={loading} style={{...mkBtn("primary"),width:"100%",marginBottom:14}}>
      {loading?<><Spin s={16}/> Planning...</>:`${t.generate} ${ICONS[meal]} ${meal} for ${day}`}
    </button>
    {err&&<Err msg={err} retry={gen}/>}
    {loading?[1,2,3,4].map(i=><Shim key={i}/>):plan.map((r,i)=><button key={i} onClick={()=>{LS.addRecent(r);onRec(r);}} style={{...ST.card,width:"100%",textAlign:"left",cursor:"pointer",display:"flex",gap:11,alignItems:"center"}} className="fade-in">
      <span style={{fontSize:28,flexShrink:0}}>{r.emoji||"🍽️"}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:13,color:C.txt}}>{r.name}</div>
        <div style={{display:"flex",gap:7,marginTop:2,flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:C.muted}}>⏱ {r.time}</span>
          <span style={{fontSize:11,color:C.muted}}>🔥 {r.cal} kcal</span>
          {r.region&&<span style={mkPill(C.a2)}>{r.region}</span>}
        </div>
        {r.why&&<div style={{fontSize:11,color:C.a2,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>💡 {r.why}</div>}
      </div>
      <HeartBtn recipe={r} userId={userId}/>
    </button>)}
  </div>;
}

// ── LEFTOVER ──────────────────────────────────────────────────
function LeftoverScreen({onRec,t,lang,userId}){
  const[step,setStep]=useState("in");
  const[items,setItems]=useState([]);
  const[inp,setInp]=useState("");
  const[recs,setRecs]=useState([]);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const QUICK=["🍚 Rice","🫘 Dal","🫓 Roti","🍞 Bread","🥗 Sabzi","🍗 Chicken","🥚 Eggs","🧀 Paneer","🥔 Potato","🍝 Pasta","🫕 Curry","🌽 Corn","🧅 Onion","🍅 Tomato","🫑 Capsicum"];
  const add=it=>{if(!items.includes(it)) setItems(p=>[...p,it]);};
  const gen=async()=>{
    setLoading(true);setErr("");
    try{
      const names=items.map(i=>i.replace(/^[^\w\u0900-\u097F]*/,"").trim()).filter(Boolean);
      let dbRes=[];
      if(SB.ok()){dbRes=await SB.searchByIngredients(names);}
      if(dbRes.length>=1){
        setRecs(dbRes);setStep("res");
      } else {
        const d=await Claude.getLeftoverRecipes(names);
        if(Array.isArray(d)&&d.length>0){setRecs(d);setStep("res");}
        else setErr("Could not generate.");
      }
    }catch(e){setErr(e.message||"Failed.");}
    setLoading(false);
  };
  return<div style={ST.scr}>
    <h2 style={{fontSize:18,fontWeight:800,marginBottom:3}}>🥘 {t.leftoverRescue}</h2>
    <p style={{color:C.muted,fontSize:13,marginBottom:14}}>Transform leftovers into delicious meals!</p>
    {step==="in"&&<>
      <p style={{fontSize:12,color:C.muted,marginBottom:7}}>{t.quickAdd}:</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12}}>
        {QUICK.map(q=><button key={q} onClick={()=>add(q)} style={{...mkBtn("out","sm"),borderRadius:20,fontSize:12,borderColor:items.includes(q)?C.accent:C.border,background:items.includes(q)?C.accentS:"transparent",color:items.includes(q)?C.accent:C.txt}}>{q}</button>)}
      </div>
      <div style={{display:"flex",gap:7,marginBottom:12}}>
        <input style={{...ST.inp,flex:1,fontSize:13}} placeholder={t.typeLeftover} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&inp.trim()){add("🥗 "+inp);setInp("");}}}/>
        <button onClick={()=>{if(inp.trim()){add("🥗 "+inp);setInp("");}}} style={{...mkBtn("primary"),padding:"10px 13px",borderRadius:10}}>+</button>
      </div>
      {err&&<Err msg={err}/>}
      {items.length>0&&<>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
          {items.map((l,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:5,background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 10px",fontSize:12}}>
            {l}<button onClick={()=>setItems(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13}}>×</button>
          </div>)}
        </div>
        <button onClick={gen} disabled={loading} style={{...mkBtn("primary"),width:"100%"}}>{loading?<><Spin s={16}/> Finding...</>:"✨ "+t.rescueLeftovers}</button>
      </>}
    </>}
    {step==="res"&&<>
      <p style={{color:C.muted,fontSize:13,marginBottom:12}}>{recs.length} recipes from your leftovers:</p>
      {loading?[1,2,3].map(i=><Shim key={i}/>):recs.map((r,i)=><button key={i} onClick={()=>{LS.addRecent(r);onRec({...r,tags:r.tags||["Leftover"]});}} style={{...ST.card,width:"100%",textAlign:"left",cursor:"pointer",display:"flex",gap:11,border:`1px solid ${C.border}`}}>
        <span style={{fontSize:32,flexShrink:0}}>{r.emoji||"🍽️"}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:13}}>{r.name}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{r.time||"20 min"} · {r.diff||"Easy"}</div>
          {r.idea&&<div style={{fontSize:11,color:C.a2,marginTop:3}}>💡 {r.idea}</div>}
        </div>
        <HeartBtn recipe={r} userId={userId}/>
      </button>)}
      <button onClick={()=>{setStep("in");setRecs([]);setErr("");}} style={{...mkBtn("ghost"),width:"100%",marginTop:6,fontSize:13}}>← {t.startOver}</button>
    </>}
  </div>;
}

// ── GROCERY ───────────────────────────────────────────────────
function GroceryScreen({t}){
  const[recipe,setRecipe]=useState("");
  const[list,setList]=useState(null);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const[checked,setChecked]=useState({});
  const gen=async()=>{if(!recipe.trim()) return;setLoading(true);setErr("");try{const d=await Claude.getGroceryList(recipe);setList(d);setChecked({});}catch(e){setErr(e.message||"Failed.");}setLoading(false);};
  const tog=item=>setChecked(p=>({...p,[item]:!p[item]}));
  const cats=[...new Set((list?.needed||[]).map(i=>i.category||"General"))];
  const done=Object.values(checked).filter(Boolean).length;
  const total=(list?.needed||[]).length;
  return<div style={ST.scr}>
    <h2 style={{fontSize:18,fontWeight:800,marginBottom:3}}>🛒 {t.smartGrocery}</h2>
    <p style={{color:C.muted,fontSize:13,marginBottom:14}}>Smart shopping list for any recipe</p>
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      <input style={{...ST.inp,flex:1}} placeholder={t.enterRecipe} value={recipe} onChange={e=>setRecipe(e.target.value)} onKeyDown={e=>e.key==="Enter"&&gen()}/>
      <button onClick={gen} disabled={loading||!recipe.trim()} style={{...mkBtn("primary"),padding:"10px 14px",borderRadius:12,flexShrink:0,opacity:!recipe.trim()?.5:1}}>{loading?<Spin s={16}/>:"Go"}</button>
    </div>
    {err&&<Err msg={err} retry={gen}/>}
    {list&&<>
      {total>0&&<div style={{...ST.card,background:done===total?C.okS:C.accentS,borderColor:(done===total?C.ok:C.accent)+"44",textAlign:"center",marginBottom:10}}>
        <span style={{color:done===total?C.ok:C.accent,fontWeight:700,fontSize:14}}>{done===total?"✅ All done!":`🛍 ${done}/${total} checked`}</span>
      </div>}
      {cats.map(cat=><div key={cat} style={{marginBottom:12}}>
        {cats.length>1&&<p style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{cat}</p>}
        {(list.needed||[]).filter(i=>(i.category||"General")===cat).map((item,i)=><div key={i} onClick={()=>tog(item.item)} style={{...ST.card,display:"flex",alignItems:"center",gap:12,cursor:"pointer",opacity:checked[item.item]?.5:1,marginBottom:7}}>
          <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${checked[item.item]?C.ok:C.border}`,background:checked[item.item]?C.ok:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {checked[item.item]&&<span style={{color:"#fff",fontSize:12}}>✓</span>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:13,textDecoration:checked[item.item]?"line-through":"none"}}>{item.item}</div>
            {item.note&&<div style={{fontSize:11,color:C.muted}}>{item.note}</div>}
          </div>
          <span style={{fontSize:12,color:C.accent,fontWeight:700,flexShrink:0}}>{item.amount}</span>
        </div>)}
      </div>)}
      {list.alternatives?.length>0&&<><h3 style={{fontSize:13,fontWeight:700,margin:"14px 0 8px"}}>♻️ {t.alternatives}</h3>
        {list.alternatives.map((alt,i)=><div key={i} style={{...ST.card,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={mkTag(C.warn)}>{alt.original}</span><span style={{color:C.muted}}>→</span><span style={mkTag(C.ok)}>{alt.substitute}</span>
          {alt.note&&<span style={{fontSize:11,color:C.muted,width:"100%"}}>{alt.note}</span>}
        </div>)}
      </>}
      {list.tips?.length>0&&<><h3 style={{fontSize:13,fontWeight:700,margin:"14px 0 8px"}}>💡 {t.shoppingTips}</h3>
        <div style={ST.card}>{list.tips.map((tip,i)=><div key={i} style={{fontSize:12,color:C.muted,marginBottom:4}}>• {tip}</div>)}</div>
      </>}
    </>}
  </div>;
}

// ── EXPLORE INDIA ─────────────────────────────────────────────
function ExploreIndiaScreen({onRec,t,userId}){
  const[sel,setSel]=useState(null);
  const[mf,setMf]=useState("All");
  const[sbDishes,setSbDishes]=useState([]);
  const[loading,setLoading]=useState(false);
  const FILTERS=["All","breakfast","lunch","dinner","snack","dessert","main course"];

  const loadState=async(s)=>{
    setSel(s);setMf("All");setLoading(true);
    try{
      const res=await fetch("/api/supabase",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type:"state",state:s.state})
      });
      const data=await res.json();
      if(Array.isArray(data)&&data.length>0){
        const sbRecipes=data.map(r=>({...r,emoji:"🍽️",time:r.minutes?r.minutes+" min":"30 min",diff:"Medium",cal:r.nutrition?.calories||320,protein:r.nutrition?.protein||"12g",tags:[r.category||"Indian"]}));
        setSbDishes([...s.dishes,...sbRecipes]);
      } else {
        setSbDishes(s.dishes);
      }
    }catch{setSbDishes(s.dishes);}
    setLoading(false);
  };
  if(sel){
    const allDishes=sbDishes.length>0?sbDishes:sel.dishes;
   const dishes=mf==="All"?allDishes:allDishes.filter(d=>(d.category||"").toLowerCase().includes(mf.toLowerCase())||(d.tags||[]).includes(mf));
    return<div style={ST.scr}>
      <button onClick={()=>setSel(null)} style={{...mkBtn("ghost","sm"),borderRadius:10,marginBottom:14}}>← {t.back}</button>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
        <span style={{fontSize:40}}>{sel.emoji}</span>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:800}}>{sel.state}</h2><p style={{color:C.muted,fontSize:12,margin:0}}>{allDishes.length} dishes</p></div>
      </div>
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:14}}>
        {FILTERS.map(f=><button key={f} onClick={()=>setMf(f)} style={{flexShrink:0,padding:"7px 12px",borderRadius:20,border:`1px solid ${mf===f?sel.color:C.border}`,background:mf===f?sel.color+"22":C.card,color:mf===f?sel.color:C.muted,cursor:"pointer",fontWeight:600,fontSize:12}}>{f}</button>)}
      </div>
      {loading?[1,2,3].map(i=><Shim key={i}/>):dishes.length===0?<div style={{textAlign:"center",padding:40,color:C.muted}}>No {mf} dishes for {sel.state}</div>
      :dishes.map((r,i)=><button key={i} onClick={()=>{const rec={...r,tags:[...(r.tags||[]),sel.state]};LS.addRecent(rec);onRec(rec);}} style={{...ST.card,width:"100%",textAlign:"left",cursor:"pointer",display:"flex",gap:14,alignItems:"center",border:`1px solid ${sel.color}33`}}>
        <span style={{fontSize:34,flexShrink:0}}>{r.emoji||"🍽️"}</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14,color:C.txt}}>{r.name}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:3}}>⏱ {r.time||"30 min"} · 🔥 {r.cal||320} kcal</div>
        </div>
        <HeartBtn recipe={{...r,tags:[...(r.tags||[]),sel.state]}} userId={userId}/>
      </button>)}
    </div>;
  }
  return<div style={ST.scr}>
    <h2 style={{fontSize:18,fontWeight:800,marginBottom:4}}>🗺️ {t.exploreIndia}</h2>
    <p style={{color:C.muted,fontSize:13,marginBottom:14}}>{INDIA_STATES.length} States · 200+ Authentic Dishes</p>
    {INDIA_STATES.map((s,i)=><button key={i} onClick={()=>loadState(s)} style={{...ST.card,width:"100%",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:14,border:`1px solid ${s.color}33`,padding:"13px 14px"}}>
      <span style={{fontSize:30,flexShrink:0}}>{s.emoji}</span>
      <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:C.txt}}>{s.state}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.dishes.length} dishes · {s.dishes[0]?.name}, {s.dishes[1]?.name}...</div></div>
      <div style={{fontSize:18,color:C.muted}}>›</div>
    </button>)}
  </div>;
return<div style={ST.scr}>
    <h2 style={{fontSize:18,fontWeight:800,marginBottom:4}}>🗺️ {t.exploreIndia}</h2>
    <p style={{color:C.muted,fontSize:13,marginBottom:14}}>{INDIA_STATES.length} States · 200+ Authentic Dishes</p>
    {INDIA_STATES.map((s,i)=><button key={i} onClick={()=>{setSel(s);setMf("All");}} style={{...ST.card,width:"100%",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:14,border:`1px solid ${s.color}33`,padding:"13px 14px"}}>
      <span style={{fontSize:30,flexShrink:0}}>{s.emoji}</span>
      <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:C.txt}}>{s.state}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.dishes.length} dishes · {s.dishes[0]?.name}, {s.dishes[1]?.name}...</div></div>
      <div style={{fontSize:18,color:C.muted}}>›</div>
    </button>)}
  </div>;
}

// ── WORLD CUISINES ────────────────────────────────────────────
function WorldCuisinesScreen({onRec,t,userId}){
  const[sel,setSel]=useState(null);
  const[mf,setMf]=useState("All");
  const[sbDishes,setSbDishes]=useState([]);
  const[loading,setLoading]=useState(false);
  const FILTERS=["All","breakfast","lunch","dinner","snack","dessert","main course"];

  const loadCuisine=async(c)=>{
    setSel(c);setMf("All");setLoading(true);
    try{
      const res=await fetch("/api/supabase",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type:"cuisine",cuisine:c.country})
      });
      const data=await res.json();
      if(Array.isArray(data)&&data.length>0){
        const sbRecipes=data.map(r=>({...r,emoji:"🍽️",time:r.minutes?r.minutes+" min":"30 min",diff:"Medium",cal:r.nutrition?.calories||320,protein:r.nutrition?.protein||"12g",tags:[r.category||"World"]}));
        setSbDishes([...c.dishes,...sbRecipes]);
      } else {
        setSbDishes(c.dishes);
      }
    }catch{setSbDishes(c.dishes);}
    setLoading(false);
  };

  if(sel){
    const allDishes=sbDishes.length>0?sbDishes:sel.dishes;
    const dishes=mf==="All"?allDishes:allDishes.filter(d=>(d.category||"").toLowerCase().includes(mf.toLowerCase())||(d.tags||[]).includes(mf));
    return<div style={ST.scr}>
      <button onClick={()=>setSel(null)} style={{...mkBtn("ghost","sm"),borderRadius:10,marginBottom:14}}>← {t.back}</button>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
        <span style={{fontSize:40}}>{sel.emoji}</span>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:800}}>{sel.country}</h2><p style={{color:C.muted,fontSize:12,margin:0}}>{allDishes.length} dishes</p></div>
      </div>
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:14}}>
        {FILTERS.map(f=><button key={f} onClick={()=>setMf(f)} style={{flexShrink:0,padding:"7px 12px",borderRadius:20,border:`1px solid ${mf===f?sel.color:C.border}`,background:mf===f?sel.color+"22":C.card,color:mf===f?sel.color:C.muted,cursor:"pointer",fontWeight:600,fontSize:12}}>{f}</button>)}
      </div>
      {loading?[1,2,3].map(i=><Shim key={i}/>):dishes.length===0?<div style={{textAlign:"center",padding:40,color:C.muted}}>No {mf} dishes for {sel.country}</div>
      :dishes.map((r,i)=><button key={i} onClick={()=>{const rec={...r,tags:[...(r.tags||[]),sel.country]};LS.addRecent(rec);onRec(rec);}} style={{...ST.card,width:"100%",textAlign:"left",cursor:"pointer",display:"flex",gap:14,alignItems:"center",border:`1px solid ${sel.color}33`}}>
        <span style={{fontSize:34,flexShrink:0}}>{r.emoji||"🍽️"}</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14,color:C.txt}}>{r.name}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:3}}>⏱ {r.time||"30 min"} · 🔥 {r.cal||320} kcal</div>
        </div>
        <HeartBtn recipe={{...r,tags:[...(r.tags||[]),sel.country]}} userId={userId}/>
      </button>)}
    </div>;
  }
  return<div style={ST.scr}>
    <h2 style={{fontSize:18,fontWeight:800,marginBottom:4}}>🌍 {t.worldCuisines}</h2>
    <p style={{color:C.muted,fontSize:13,marginBottom:14}}>{WORLD.length} Countries · Global Authentic Recipes</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {WORLD.map((c,i)=><button key={i} onClick={()=>loadCuisine(c)} style={{background:C.card,border:`1px solid ${c.color}44`,borderRadius:16,padding:"18px 14px",cursor:"pointer",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>{c.emoji}</div>
        <div style={{fontWeight:700,fontSize:14,color:C.txt}}>{c.country}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:4}}>{c.dishes.length} dishes</div>
      </button>)}
    </div>
  </div>;
}

// ── NUTRITION TRACKER ─────────────────────────────────────────
function NutritionTrackerScreen({t}){
  const[goal,setGoalState]=useState(()=>LS.get("cal_goal",2000));
  const[editGoal,setEditGoal]=useState(false);
  const[goalInp,setGoalInp]=useState(goal);
  const[log,setLog]=useState(()=>LS.getTodayLog());
  const[search,setSearch]=useState("");
  const[result,setResult]=useState(null);
  const[searching,setSearching]=useState(false);
  const todayCal=log.reduce((s,e)=>s+(parseInt(e.calories)||0),0);
  const remaining=goal-todayCal;
  const pct=Math.min(100,(todayCal/goal)*100);
  const doSearch=async()=>{if(!search.trim()) return;setSearching(true);setResult(null);try{const d=await Claude.getNutrition(search);setResult(d);}catch{}setSearching(false);};
  const logMeal=()=>{if(!result) return;LS.addNutrLog({name:search,calories:result.calories||0,protein:result.protein||"0g",carbs:result.carbs||"0g",fat:result.fat||"0g"});setLog(LS.getTodayLog());setSearch("");setResult(null);};
  return<div style={ST.scr}>
    <h2 style={{fontSize:18,fontWeight:800,marginBottom:3}}>📊 {t.nutritionTracker}</h2>
    <p style={{color:C.muted,fontSize:13,marginBottom:14}}>Track your daily nutrition</p>
    <div style={{...ST.card,marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontWeight:700,fontSize:13}}>🎯 {t.calorieGoal}</span>
        <button onClick={()=>{setEditGoal(p=>!p);setGoalInp(goal);}} style={{...mkBtn("ghost","sm"),borderRadius:20}}>{editGoal?"Cancel":"Edit"}</button>
      </div>
      {editGoal&&<div style={{display:"flex",gap:8,marginBottom:10}}>
        <input style={{...ST.inp,flex:1,fontSize:13}} type="number" value={goalInp} onChange={e=>setGoalInp(e.target.value)} placeholder="e.g. 2000"/>
        <button onClick={()=>{const g=parseInt(goalInp)||2000;setGoalState(g);LS.set("cal_goal",g);setEditGoal(false);}} style={{...mkBtn("primary"),padding:"10px 14px",borderRadius:10}}>Save</button>
      </div>}
      <div style={{height:8,background:C.border,borderRadius:4,overflow:"hidden",marginBottom:8}}>
        <div style={{height:"100%",width:`${pct}%`,background:pct>90?C.red:pct>70?C.warn:grad,borderRadius:4,transition:"width 0.4s"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
        <span style={{color:C.muted}}>{todayCal} kcal consumed</span>
        <span style={{color:remaining<0?C.red:C.ok,fontWeight:700}}>{remaining<0?`Over by ${Math.abs(remaining)}`:`${remaining} ${t.remaining}`}</span>
      </div>
    </div>
    <div style={{...ST.card,marginBottom:14}}>
      <p style={{fontSize:13,fontWeight:700,marginBottom:8}}>🔍 Search nutrition</p>
      <div style={{display:"flex",gap:7}}>
        <input style={{...ST.inp,flex:1,fontSize:13}} placeholder="e.g. Dal Makhani, 1 cup" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()}/>
        <button onClick={doSearch} disabled={searching||!search.trim()} style={{...mkBtn("primary"),padding:"10px 14px",borderRadius:10,opacity:!search.trim()?.5:1}}>{searching?<Spin s={14}/>:"Go"}</button>
      </div>
      {result&&<div className="fade-in" style={{marginTop:12}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
          {[{lb:"Cal",v:result.calories,ic:"🔥",col:C.accent},{lb:"Protein",v:result.protein,ic:"💪",col:C.a2},{lb:"Carbs",v:result.carbs,ic:"🌾",col:C.warn},{lb:"Fat",v:result.fat,ic:"💧",col:C.ok}].map((n,i)=><div key={i} style={{background:C.bg,border:`1px solid ${n.col}33`,borderRadius:10,padding:"8px 4px",textAlign:"center"}}>
            <div style={{fontSize:15}}>{n.ic}</div>
            <div style={{fontWeight:700,fontSize:12,color:n.col,marginTop:2}}>{n.v}</div>
            <div style={{fontSize:9,color:C.muted}}>{n.lb}</div>
          </div>)}
        </div>
        {result.dietType&&<div style={{fontSize:11,color:C.a2,marginBottom:8}}>🥗 {result.dietType}</div>}
        <button onClick={logMeal} style={{...mkBtn("primary"),width:"100%",borderRadius:12,fontSize:13}}>+ {t.logMeal}</button>
      </div>}
    </div>
    <h3 style={{fontSize:14,fontWeight:700,marginBottom:10}}>📋 {t.todayLog} ({log.length})</h3>
    {log.length===0?<div style={{...ST.card,textAlign:"center",padding:24,color:C.muted,fontSize:13}}>No meals logged today</div>
    :log.map((e,i)=><div key={i} style={{...ST.card,display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
      <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{e.name}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>🔥 {e.calories} · 💪 {e.protein}</div></div>
 <span style={mkPill()}>{e.calories} kcal</span>
</div>)}
  </div>;
}
// ── FAVORITES ─────────────────────────────────────────────────
function FavoritesScreen({onRec,t,userId}){
  const[favs,setFavs]=useState(()=>LS.getFavs());
  const[filter,setFilter]=useState("All");
  const refresh=()=>setFavs(LS.getFavs());
  const tags=["All",...new Set(favs.flatMap(r=>r.tags||[]))].slice(0,8);
  const filtered=filter==="All"?favs:favs.filter(r=>(r.tags||[]).includes(filter));
  return<div style={ST.scr}>
    <h2 style={{fontSize:18,fontWeight:800,marginBottom:3}}>❤️ {t.favorites}</h2>
    <p style={{color:C.muted,fontSize:13,marginBottom:12}}>{favs.length} saved · {SB.ok()?"Supabase sync ready":"Local storage"}</p>
    {favs.length>1&&tags.length>1&&<div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:12}}>
      {tags.map(tag_=><button key={tag_} onClick={()=>setFilter(tag_)} style={{flexShrink:0,padding:"6px 12px",borderRadius:20,border:`1px solid ${filter===tag_?C.accent:C.border}`,background:filter===tag_?C.accentS:C.card,color:filter===tag_?C.accent:C.muted,cursor:"pointer",fontWeight:600,fontSize:11}}>{tag_}</button>)}
    </div>}
    {favs.length===0?<div style={{textAlign:"center",padding:"50px 20px"}}>
      <div style={{fontSize:60,marginBottom:14}}>🤍</div>
      <h3 style={{fontSize:17,fontWeight:700,marginBottom:8}}>{t.noFavs}</h3>
      <p style={{color:C.muted,fontSize:13}}>Tap 🤍 on any recipe to save it here</p>
    </div>:filtered.map((r,i)=><div key={i} style={{...ST.card,display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
      <button onClick={()=>{LS.addRecent(r);onRec(r);}} style={{display:"flex",alignItems:"center",gap:12,flex:1,background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
        <span style={{fontSize:34}}>{r.emoji||"🍽️"}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:14,color:C.txt}}>{r.name}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{r.time||"30 min"} · {r.diff||"Easy"}</div>
          {r.savedAt&&<div style={{fontSize:10,color:C.sub,marginTop:2}}>Saved {new Date(r.savedAt).toLocaleDateString("en-IN",{month:"short",day:"numeric"})}</div>}
        </div>
      </button>
      <HeartBtn recipe={r} userId={userId} onToggle={()=>setTimeout(refresh,100)}/>
    </div>)}
  </div>;
}

// ── SETTINGS ──────────────────────────────────────────────────
function SettingsScreen({lang,setLang,user,onSignOut,t}){
  const testVoice=()=>{const texts={en:"Hello! I'm your CookMate AI kitchen assistant!",hi:"नमस्ते! मैं आपकी CookMate AI रसोई सहायक हूँ!",hinglish:"Hello! Main aapki CookMate AI assistant hoon!"};Voice.speak(texts[lang]||texts.en,lang);};
  return<div style={ST.scr}>
    <h2 style={{fontSize:18,fontWeight:800,marginBottom:14}}>⚙️ {t.settings}</h2>
    <div style={{...ST.card,display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
      <div style={{width:44,height:44,borderRadius:"50%",background:grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{user?.name?.[0]?.toUpperCase()||"👤"}</div>
      <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{user?.name||"Chef"}</div><div style={{fontSize:11,color:C.muted}}>{user?.email||user?.phone||"Guest"}</div></div>
      <button onClick={onSignOut} style={{...mkBtn("red","sm"),borderRadius:10}}>Sign Out</button>
    </div>
    <h3 style={{fontSize:14,fontWeight:700,marginBottom:10}}>🌐 {t.language}</h3>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
      {LANGS.map(l=><button key={l.code} onClick={()=>setLang(l.code)} style={{...ST.card,display:"flex",alignItems:"center",gap:10,cursor:"pointer",border:`1px solid ${lang===l.code?C.accent:C.border}`,background:lang===l.code?C.accentS:C.card,padding:"10px 12px",marginBottom:0}}>
        <span style={{fontSize:18}}>{l.flag}</span>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:12,color:lang===l.code?C.accent:C.txt}}>{l.native}</div><div style={{fontSize:10,color:C.muted}}>{l.label}</div></div>
        {lang===l.code&&<span style={{color:C.ok,fontSize:14}}>✓</span>}
      </button>)}
    </div>
    <h3 style={{fontSize:14,fontWeight:700,marginBottom:8}}>🎙 Voice Assistant</h3>
    <div style={{...ST.card,marginBottom:14}}>
      <div style={{fontSize:12,color:C.muted,lineHeight:1.6,marginBottom:10}}>Female voice auto-selected for {LANGS.find(l=>l.code===lang)?.label}. For Hindi: Settings → Accessibility → Text-to-Speech → Install Hindi.</div>
      <button onClick={testVoice} style={{...mkBtn("ghost"),borderRadius:10,fontSize:13}}>🔊 Test Voice</button>
    </div>
  </div>;
}

// ── MAIN APP ──────────────────────────────────────────────────
const NAV=[{id:"home",ic:"🏠",lb:"home"},{id:"scan",ic:"📷",lb:"scan"},{id:"planner",ic:"📅",lb:"planner"},{id:"leftover",ic:"🥘",lb:"leftover"},{id:"grocery",ic:"🛒",lb:"grocery"}];

export default function CookMateApp(){
  useEffect(()=>{
  if(window.location.hash.includes("access_token")){
    window.history.replaceState(null,"",window.location.pathname);
  }
},[]);
  const[user,setUser]=useState(()=>LS.get("user"));
  const[nav,setNav]=useState("home");
  const[recipe,setRecipe]=useState(null);
  const[lang,setLangState]=useState(()=>LS.get("lang","en"));
  const[recents,setRecents]=useState([]);

  useEffect(()=>{Voice.init();setRecents(LS.getRecent());},[]);

  const t=TR[lang]||TR.en;
  const setLang=l=>{setLangState(l);LS.set("lang",l);};
  const handleLogin=u=>{setUser(u);LS.set("user",u);};
 const handleSignOut=async()=>{
  await supabase.auth.signOut();
  try{localStorage.clear();}catch{}
  setUser(null);
  setRecipe(null);
  setNav("home");
  window.location.href="/";
};
const onRec=r=>{setRecipe(r);LS.addRecent(r);};
const onBack=()=>{setRecipe(null);setRecents(LS.getRecent());};
const userId=user?.id||null;

  if(!user) return<div style={ST.app}><style>{CSS}</style><AuthScreen onLogin={handleLogin}/></div>;

  if(recipe) return<div style={ST.app}>
    <style>{CSS}</style>
    <header style={ST.hdr}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22,padding:"3px 7px"}}>←</button>
      <div style={ST.logo}>🍳 CookMate AI</div>
      <HeartBtn recipe={recipe} userId={userId}/>
    </header>
    <RecipeDetail recipe={recipe} onBack={onBack} t={t} lang={lang} userId={userId}/>
    <FloatingChat lang={lang}/>
  </div>;

  const screens={
    home:<HomeScreen user={user} onNav={setNav} onRec={onRec} t={t} lang={lang} recents={recents}/>,
    scan:<ScanScreen onRec={onRec} t={t} lang={lang} userId={userId}/>,
    planner:<PlannerScreen onRec={onRec} t={t} lang={lang} userId={userId}/>,
    leftover:<LeftoverScreen onRec={onRec} t={t} lang={lang} userId={userId}/>,
    grocery:<GroceryScreen t={t} lang={lang}/>,
    favorites:<FavoritesScreen onRec={onRec} t={t} userId={userId}/>,
    india:<ExploreIndiaScreen onRec={onRec} t={t} userId={userId}/>,
    world:<WorldCuisinesScreen onRec={onRec} t={t} userId={userId}/>,
    tracker:<NutritionTrackerScreen t={t} lang={lang}/>,
    settings:<SettingsScreen lang={lang} setLang={setLang} user={user} onSignOut={handleSignOut} t={t}/>,
  };

  return<div style={ST.app}>
    <style>{CSS}</style>
    <header style={ST.hdr}>
      <div style={ST.logo}>🍳 CookMate AI</div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <button onClick={()=>setNav("india")} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:nav==="india"?C.accent:C.muted}}>🗺️</button>
        <button onClick={()=>setNav("world")} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:nav==="world"?"#3498DB":C.muted}}>🌍</button>
        <button onClick={()=>setNav("tracker")} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:nav==="tracker"?"#9B59B6":C.muted}}>📊</button>
        <button onClick={()=>setNav("favorites")} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:nav==="favorites"?C.red:C.muted}}>❤️</button>
        <button onClick={()=>setNav("settings")} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:nav==="settings"?C.accent:C.muted}}>⚙️</button>
      </div>
    </header>
    <main style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
      {screens[nav]||screens.home}
    </main>
    <nav style={ST.nav}>
      {NAV.map(item=><button key={item.id} onClick={()=>setNav(item.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 0",cursor:"pointer",color:nav===item.id?C.accent:C.muted,fontSize:10,fontWeight:nav===item.id?700:500,background:"none",border:"none",transition:"color 0.2s"}}>
        <span style={{fontSize:20}}>{item.ic}</span>
        <span>{t[item.lb]||item.lb}</span>
      </button>)}
    </nav>
    <FloatingChat lang={lang}/>
  </div>;
}
