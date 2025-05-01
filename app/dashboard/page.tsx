'use client';

import { useEffect, useState } from "react";
import { SubjectEntity } from '@/types/SubjectEntity';
import {
    createSubject,
    deleteSubject,
    endSubjectTimer,
    fetchSubjects,
    getUserDetails,
    startSubjectTimer,
} from '@/actions/fetchMethods';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Play, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Duration } from 'luxon';

const COLORS = ['#00C4FF', '#1E1B4B', '#FFA500', '#00FF88', '#FF3366'];

export default function Dashboard() {
    const [subjects, setSubjects] = useState<SubjectEntity[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const refreshSubjects = async () => {
        const res = await fetchSubjects();
        setSubjects(res);
    };

    useEffect(() => {
        refreshSubjects();
    }, []);

    const handleAddSubject = async () => {
        if (!name) return;
        const user = await getUserDetails();
        if (!user) return;
        await createSubject(user.id, name, description);
        setName('');
        setDescription('');
        refreshSubjects();
    };

    const handleToggleTimer = async (subject: SubjectEntity) => {
        if (subject.running) {
            await endSubjectTimer(subject.id);
        } else {
            await startSubjectTimer(subject.id);
        }
        setTimeout(refreshSubjects, 300); // Give backend time to update
    };

    const handleDelete = async (id: number) => {
        await deleteSubject(id);
        refreshSubjects();
    };

    const formatDuration = (seconds: number) => {
        return Duration.fromObject({ seconds }).toFormat('m:ss');
    };

    const totalDuration = subjects.reduce((acc, s) => acc + s.timeAllotted, 0);

    const getPercent = (time: number) =>
        totalDuration === 0 ? 0 : (time / totalDuration) * 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            <div className="col-span-2">
                <h2 className="text-xl font-bold">Your Subjects</h2>
                <div className="flex items-center gap-2 mt-2">
                    <Input
                        placeholder="Add a new subject..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Button onClick={handleAddSubject}>+</Button>
                </div>
                <div className="mt-4 space-y-4">
                    {subjects.map((s) => (
                        <Card key={s.id} className="flex items-center justify-between px-4 py-2">
                            <div>
                                <h3 className="text-lg font-semibold lowercase">{s.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    ⏱ {formatDuration(s.timeAllotted)} total
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {s.numberOfSessions} session{s.numberOfSessions !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" onClick={() => handleToggleTimer(s)}>
                                    {s.running ? <span className="text-red-600 font-bold">■</span> : <Play />}
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Donut Chart */}
            <div>
                <Card>
                    <CardContent className="p-4">
                        <h2 className="text-lg font-bold">Time Overview</h2>
                        <div className="relative w-48 h-48 mx-auto my-4">
                            <svg viewBox="0 0 200 200" className="w-full h-full rotate-[-90deg]">
                                {(() => {
                                    let cumulativeAngle = 0;
                                    return subjects.map((subject, i) => {
                                        const percent = getPercent(subject.timeAllotted);
                                        const angle = (percent / 100) * 360;
                                        const largeArc = angle > 180 ? 1 : 0;

                                        const startX = 100 + 80 * Math.cos((Math.PI / 180) * cumulativeAngle);
                                        const startY = 100 + 80 * Math.sin((Math.PI / 180) * cumulativeAngle);
                                        const endAngle = cumulativeAngle + angle;
                                        const endX = 100 + 80 * Math.cos((Math.PI / 180) * endAngle);
                                        const endY = 100 + 80 * Math.sin((Math.PI / 180) * endAngle);

                                        const d = `
                                            M 100 100
                                            L ${startX} ${startY}
                                            A 80 80 0 ${largeArc} 1 ${endX} ${endY}
                                            Z
                                        `;

                                        cumulativeAngle = endAngle;

                                        return <path key={i} d={d} fill={COLORS[i % COLORS.length]} />;
                                    });
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-xl font-bold">{formatDuration(totalDuration)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm mt-2 space-y-1">
                            {subjects.map((s, i) => (
                                <div key={s.id} className="flex justify-between">
                                    <span style={{ color: COLORS[i % COLORS.length] }}>{s.name}</span>
                                    <span className="font-mono text-muted-foreground">
                                        {formatDuration(s.timeAllotted)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
