import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Star } from "lucide-react";

const mockLeaderboard = [
  { rank: 1, name: "Sarah Johnson", points: 980, department: "IT", year: "2nd Year", avatar: "SJ" },
  { rank: 2, name: "David Chen", points: 955, department: "IT", year: "2nd Year", avatar: "DC" },
  { rank: 3, name: "Emily Davis", points: 930, department: "IT", year: "2nd Year", avatar: "ED" },
  { rank: 4, name: "Michael Wilson", points: 910, department: "IT", year: "2nd Year", avatar: "MW" },
  { rank: 5, name: "Lisa Anderson", points: 895, department: "IT", year: "2nd Year", avatar: "LA" },
  { rank: 6, name: "James Brown", points: 875, department: "IT", year: "2nd Year", avatar: "JB" },
  { rank: 7, name: "Anna Martinez", points: 860, department: "IT", year: "2nd Year", avatar: "AM" },
  { rank: 8, name: "Robert Taylor", points: 845, department: "IT", year: "2nd Year", avatar: "RT" },
  { rank: 9, name: "Jennifer Lee", points: 830, department: "IT", year: "2nd Year", avatar: "JL" },
  { rank: 10, name: "Christopher White", points: 815, department: "IT", year: "2nd Year", avatar: "CW" }
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <Star className="h-5 w-5 text-muted-foreground" />;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
    case 2:
      return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
    case 3:
      return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
    default:
      return "bg-background";
  }
};

export const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-card-secondary">
      {/* Header */}
      <div className="bg-background border-b border-border p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-foreground">IT 2nd Year Leaderboard</h1>
            <p className="text-muted-foreground mt-1">Top performers in quiz competitions</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {mockLeaderboard.slice(0, 3).map((student, index) => (
            <Card key={student.rank} className={`${getRankStyle(student.rank)} relative overflow-hidden`}>
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">
                  {getRankIcon(student.rank)}
                </div>
                <CardTitle className="text-lg">#{student.rank}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Avatar className="w-16 h-16 mx-auto mb-3">
                  <AvatarFallback className="text-lg font-semibold">
                    {student.avatar}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-foreground">{student.name}</h3>
                <p className="text-2xl font-bold text-primary mt-2">{student.points}</p>
                <p className="text-sm text-muted-foreground">Points</p>
                <Badge variant="outline" className="mt-2">
                  {student.department} - {student.year}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Rankings</CardTitle>
            <CardDescription>
              Full leaderboard for all students in the department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockLeaderboard.map((student) => (
                <div
                  key={student.rank}
                  className={`flex items-center justify-between p-4 rounded-lg border ${getRankStyle(student.rank)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[60px]">
                      {getRankIcon(student.rank)}
                      <span className="font-bold text-lg">#{student.rank}</span>
                    </div>
                    
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {student.avatar}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h4 className="font-medium text-foreground">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {student.department} - {student.year}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{student.points}</p>
                    <p className="text-sm text-muted-foreground">Points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};