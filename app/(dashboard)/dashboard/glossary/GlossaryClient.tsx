'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Filter, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/brand/Logo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

const glossaryData: GlossaryTerm[] = [
  {
    term: 'Fund Structure',
    definition: 'The legal and organizational framework of an investment fund, including entity types, jurisdiction, and regulatory compliance requirements.',
    category: 'Fund Management',
    relatedTerms: ['Fund Admin', 'Law Firm', 'Entity to Create Fund'],
  },
  {
    term: 'Fund Admin',
    definition: 'Service companies that are responsible for the back-office activities of the fund (reporting, accounting, capital calls, distributions...).',
    category: 'Fund Management',
    relatedTerms: ['Fund Structure', 'Fund Subscription'],
  },
  {
    term: 'Law Firm',
    definition: 'Legal counsel providing regulatory, compliance, and transactional support for fund formation and operations.',
    category: 'Fund Management',
    relatedTerms: ['Fund Structure', 'Compliance'],
  },
  {
    term: 'Entity to Create Fund',
    definition: 'Entity to create fund on Fundsub, matching with Client name on SFDC and ClickUp.',
    category: 'Fund Management',
    relatedTerms: ['Fund Structure', 'Fund Engagement'],
  },
  {
    term: 'Investment Type',
    definition: 'The classification of investments made by the fund, such as venture capital, private equity, real estate, or hedge fund strategies.',
    category: 'Investment',
    relatedTerms: ['Fund Engagement', 'Portfolio'],
  },
  {
    term: 'Fund Engagement',
    definition: 'Specifies the Type of fund engagement (type of sub-doc) that the digitization squad is digitizing during new form building. Typical types include: Fundraise (process of completing documentation for financial contributions), SPV (allows investors to pool resources to invest in 1 fund), Co-Investment (allows investors to invest directly alongside PE funds), Indication of Interest (pre-fundraise document), MSL/MFN (secondary elections for specific stipulations), and AML/KYC Collection (documentation to prove investor identity/residency).',
    category: 'Fund Management',
    relatedTerms: ['Investment Type', 'Partner', 'Fund Subscription'],
  },
  {
    term: 'Complexity Level',
    definition: 'A rating system (Light, Medium, Heavy, Extreme Heavy) indicating complexity based on structure. For New Forms: Light (<30 logic pages), Medium (30-70 pages), Heavy (70-120 pages), Extreme Heavy (120+ pages). Logic pages = common pages + different pages between sub-docs. For Updates: determined by number of items (X) and total estimation hours (Y). Light: X<6 items and Y≤6 hours; Medium: 6≤X≤12 items and 6<Y<16 hours; Heavy: X>12 items and Y≥16 hours, or any item falls outside update scope.',
    category: 'Operations',
    relatedTerms: ['Project Volume', 'Performance Metrics', 'New Form'],
  },
  {
    term: 'New Form',
    definition: 'A project type involving the creation of entirely new subscription forms from scratch. Part of Fundsub service for normal digitization (main product).',
    category: 'Project Types',
    relatedTerms: ['Update', 'Project Volume', 'Complexity Level', 'Digitization'],
  },
  {
    term: 'Update',
    definition: 'Update request from customer with existing forms. A project type focused on modifying, enhancing, or maintaining existing forms, systems, or processes. Part of Fundsub service.',
    category: 'Project Types',
    relatedTerms: ['New Form', 'Project Volume', 'Complexity Level'],
  },
  {
    term: 'Export',
    definition: 'A service allowing GP to download data that LP filled in smart forms. Export template is a spreadsheet document that contains those data.',
    category: 'Data Operations',
    relatedTerms: ['Import', 'Integration', 'Data Extraction'],
  },
  {
    term: 'Import',
    definition: 'The filling of LP\'s pre-existent data into the funds operating on Anduin platform before LP get accessed/invited to their subscription package. This pre-filling of data could be performed by Anduin or GP. Import service is introduced because GP want to avoid asking their investors to repeatedly input data into subscription docs.',
    category: 'Data Operations',
    relatedTerms: ['Export', 'Integration', 'IDM'],
  },
  {
    term: 'IDM',
    definition: 'Investor Data Management - Tasks dedicated to Investor Data Management, including creating Profile form, creating mappings, updating Profile form and updating mappings.',
    category: 'Data Operations',
    relatedTerms: ['Integration', 'Import', 'Export'],
  },
  {
    term: 'Integration',
    definition: 'Integration Platform - The process of connecting different systems, applications, or data sources to work together seamlessly.',
    category: 'Technology',
    relatedTerms: ['Export', 'Import', 'IDM', 'Integration Platform'],
  },
  {
    term: 'Integration Platform',
    definition: 'Platform service for connecting and integrating various systems and data sources.',
    category: 'Technology',
    relatedTerms: ['Integration', 'IDM', 'Data Operations'],
  },
  {
    term: 'Data Extraction',
    definition: 'OCR service for requests extracting data from offline PDFs by using OCR (Textract tool) or by manual methods.',
    category: 'Data Operations',
    relatedTerms: ['Export', 'Import', 'Digitization'],
  },
  {
    term: 'Project Volume',
    definition: 'The total number of projects categorized by type (New Form, Update, Export, Import, IDM, Integration) for a given client or time period.',
    category: 'Operations',
    relatedTerms: ['New Form', 'Update', 'Performance Metrics'],
  },
  {
    term: 'Performance Metrics',
    definition: 'Quantitative measures of operational efficiency, including average effort (hours), average days for new forms, and average days for updates.',
    category: 'Operations',
    relatedTerms: ['Project Volume', 'Complexity Level'],
  },
  {
    term: 'ClickUp ID',
    definition: 'A unique identifier assigned to projects, tasks, or entities within the ClickUp project management platform.',
    category: 'Technology',
    relatedTerms: ['Project Volume', 'Recent Activities'],
  },
  {
    term: 'Folder ID',
    definition: 'A unique identifier for client folders in the organizational structure, used for tracking and data retrieval.',
    category: 'Technology',
    relatedTerms: ['ClickUp ID'],
  },
  {
    term: 'Partner',
    definition: 'A senior investment professional or key stakeholder in the fund management organization, often responsible for fund strategy and investor relations.',
    category: 'Fund Management',
    relatedTerms: ['Entity to Create Fund', 'Fund Engagement'],
  },
  {
    term: 'Recent Activities',
    definition: 'A log of the most recent projects, tasks, or operational events associated with a client, providing visibility into ongoing work.',
    category: 'Operations',
    relatedTerms: ['Project Volume', 'ClickUp ID'],
  },
  {
    term: 'Digitization',
    definition: 'The process of converting traditional paper-based subscription documents into digital smart forms and automated systems.',
    category: 'Technology',
    relatedTerms: ['New Form', 'Digitization Version', 'Anduin Essentials'],
  },
  {
    term: 'Digitization Version',
    definition: 'Indicates digitization process applicable for new forms only. Two versions: (1) Checklist - current version where checklist is built without form structure notes, (2) Blueprint - checklist is written by Catala (Form Blueprint).',
    category: 'Technology',
    relatedTerms: ['Digitization', 'New Form'],
  },
  {
    term: 'Client Context',
    definition: 'Comprehensive information about a client including basic info, project counts, performance metrics, and recent activities, used for informed decision-making.',
    category: 'Operations',
    relatedTerms: ['Performance Metrics', 'Project Volume', 'Recent Activities'],
  },
  {
    term: 'Fund Subscription',
    definition: 'A fund subscription refers to the process by which investors sign up and commit to investing in a fund before the actual purchase is closed.',
    category: 'Fund Management',
    relatedTerms: ['Subscription Agreement', 'Fund Admin', 'Fund Engagement'],
  },
  {
    term: 'Subscription Agreement',
    definition: 'A Subscription Agreement is a document in which an investor makes a capital commitment to a private equity fund in exchange for an interest in the fund.',
    category: 'Fund Management',
    relatedTerms: ['Fund Subscription'],
  },
  {
    term: 'Fundsub Service',
    definition: 'Services related to fund subscription forms, including: (1) Digitization - EO: Normal Digitization (Main Product), (2) Anduin Essentials: Form digitization with limited logic, (3) Update: Update requests from customers with new forms.',
    category: 'Services',
    relatedTerms: ['New Form', 'Update', 'Anduin Essentials'],
  },
  {
    term: 'Anduin Essentials',
    definition: 'Form digitization service with limited logic capabilities, part of Fundsub service offerings.',
    category: 'Services',
    relatedTerms: ['Fundsub Service', 'Digitization', 'New Form'],
  },
];

const categories = ['All', 'Fund Management', 'Investment', 'Operations', 'Project Types', 'Data Operations', 'Technology', 'Services'];

export function GlossaryClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Filter terms based on search query and category
  const filteredTerms = glossaryData.filter(term => {
    const matchesSearch = searchQuery === '' ||
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || term.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group terms alphabetically
  const groupedTerms = filteredTerms.reduce((acc, term) => {
    const firstLetter = term.term[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  const sortedLetters = Object.keys(groupedTerms).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--color-background))] to-[hsl(var(--color-muted)_/_0.2)]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar onSignOut={handleSignOut} onCollapseChange={setSidebarCollapsed} />
      </div>

      {/* Top Bar - Hidden on mobile */}
      <div className="hidden lg:block">
        <TopBar user={null} sidebarCollapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b bg-[hsl(var(--color-card))]/95 backdrop-blur-sm px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Logo size="sm" className="rounded-lg" />
          <h1 className="text-base font-bold">Glossary</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 lg:mt-16 mt-14 p-4 lg:p-8 min-h-screen transition-all duration-300">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Industry Glossary</h1>
                <p className="text-[hsl(var(--color-muted-foreground))]">
                  Key terms and definitions for fund management and digitization
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--color-muted-foreground))]" />
                  <Input
                    type="text"
                    placeholder="Search terms or definitions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="h-4 w-4 text-[hsl(var(--color-muted-foreground))]" />
                  <span className="text-sm text-[hsl(var(--color-muted-foreground))]">Filter by:</span>
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${
                        selectedCategory === category
                          ? 'bg-[hsl(var(--color-primary))] text-white'
                          : 'hover:bg-[hsl(var(--color-muted))]'
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>

                {/* Results Count */}
                <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                  Showing {filteredTerms.length} of {glossaryData.length} terms
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Glossary Terms */}
          {filteredTerms.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--color-muted-foreground))] opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No terms found</h3>
                <p className="text-[hsl(var(--color-muted-foreground))]">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {sortedLetters.map(letter => (
                <div key={letter} className="space-y-3">
                  {/* Letter Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{letter}</span>
                    </div>
                    <div className="flex-1 h-px bg-[hsl(var(--color-border))]" />
                  </div>

                  {/* Terms */}
                  <div className="grid gap-3">
                    {groupedTerms[letter].map((term, index) => (
                      <Card key={`${term.term}-${index}`} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <CardTitle className="text-xl">{term.term}</CardTitle>
                            <Badge variant="outline" className="shrink-0">
                              {term.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-[hsl(var(--color-foreground))] leading-relaxed">
                            {term.definition}
                          </p>
                          {term.relatedTerms && term.relatedTerms.length > 0 && (
                            <div className="pt-2 border-t border-[hsl(var(--color-border))]">
                              <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-2">
                                Related terms:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {term.relatedTerms.map(relatedTerm => (
                                  <Badge
                                    key={relatedTerm}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-[hsl(var(--color-primary)_/_0.1)] transition-colors"
                                    onClick={() => setSearchQuery(relatedTerm)}
                                  >
                                    {relatedTerm}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
